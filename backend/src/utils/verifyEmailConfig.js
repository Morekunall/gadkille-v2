const { getTransporter, getEmailConfigStatus } = require('./emailService');

const VERIFY_TIMEOUT_MS = 8000;

const withTimeout = (promise, ms, label) =>
  Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    }),
  ]);

const verifyEmailConfig = async () => {
  const status = getEmailConfigStatus();

  if (!status.configured) {
    console.warn(
      '[email] Not configured — set RESEND_API_KEY (works on Render) or SMTP_HOST, SMTP_USER, SMTP_PASS.'
    );
    return { ...status, verified: false };
  }

  if (status.resend) {
    console.log('[email] Resend API key present — emails will use HTTPS (works on Render)');
    return { ...status, verified: true };
  }

  const transport = getTransporter();
  if (!transport) {
    return { ...status, verified: false };
  }

  try {
    await withTimeout(transport.verify(), VERIFY_TIMEOUT_MS, 'SMTP verify');
    console.log('[email] SMTP connection verified');
    return { ...status, verified: true };
  } catch (err) {
    console.warn(
      '[email] SMTP verify failed:',
      err.message,
      '— Use RESEND_API_KEY on Render (free SMTP port 587 is often blocked).'
    );
    return { ...status, verified: false, error: err.message };
  }
};

module.exports = verifyEmailConfig;
