const nodemailer = require('nodemailer');
const { Resend } = require('resend');

let transporter;
let resendClient;
let smtpSkippedOnRenderLogged = false;

const isProduction = () => process.env.NODE_ENV === 'production';
const isRenderHost = () => process.env.RENDER === 'true' || Boolean(process.env.RENDER_SERVICE_ID);

/** Render blocks outbound SMTP (port 587). Use Resend HTTPS API instead. */
const isSmtpBlockedHost = () =>
  isProduction() && isRenderHost() && process.env.SMTP_ALLOW_ON_RENDER !== 'true';

const resendSetupHint =
  'Add RESEND_API_KEY on Render (https://resend.com → API Keys). SMTP port 587 is blocked on Render.';

const getTransporter = () => {
  if (transporter) return transporter;

  if (isSmtpBlockedHost()) {
    if (!smtpSkippedOnRenderLogged) {
      smtpSkippedOnRenderLogged = true;
      console.warn(`[email] SMTP disabled on Render — ${resendSetupHint}`);
    }
    return null;
  }

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return null;
  }

  if (SMTP_HOST.includes('@')) {
    console.error(
      '[email] SMTP_HOST must be a mail server hostname (e.g. smtp.gmail.com), not an email address.'
    );
    return null;
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: SMTP_SECURE === 'true',
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    auth: {
      user: SMTP_USER,
      pass: String(SMTP_PASS).replace(/\s/g, ''),
    },
  });

  return transporter;
};

const fromAddress = () =>
  process.env.EMAIL_FROM || `"GadKille" <${process.env.SMTP_USER || 'noreply@gadkille.com'}>`;

const frontendUrl = () => {
  const raw = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173';
  return String(raw).trim().replace(/\/$/, '');
};

const escapeHtml = (str) =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const isDev = () => process.env.NODE_ENV !== 'production';

const resendFromAddress = () => {
  const raw =
    process.env.RESEND_FROM || process.env.EMAIL_FROM || 'Gadkille <onboarding@resend.dev>';
  return String(raw).trim().replace(/^["']|["']$/g, '');
};

const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return null;
  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }
  return resendClient;
};

const getEmailConfigStatus = () => {
  const hasResend = Boolean(process.env.RESEND_API_KEY?.trim());
  const hasSmtpVars = Boolean(
    process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
  );
  const smtpBlocked = isSmtpBlockedHost();
  const smtpUsable = hasSmtpVars && !smtpBlocked;
  const configured = hasResend || smtpUsable;

  let hint = null;
  if (!configured) {
    hint = isRenderHost() ? resendSetupHint : 'Set RESEND_API_KEY or SMTP_HOST, SMTP_USER, SMTP_PASS.';
  } else if (hasSmtpVars && smtpBlocked && !hasResend) {
    hint = `SMTP vars are set but ignored on Render. ${resendSetupHint}`;
  }

  return {
    configured,
    provider: hasResend ? 'resend' : smtpUsable ? 'smtp' : null,
    resend: hasResend,
    smtp: smtpUsable,
    smtpBlockedOnRender: smtpBlocked && hasSmtpVars,
    hint,
  };
};

const sendViaResend = async ({ to, subject, html, text }) => {
  const resend = getResendClient();
  if (!resend) return null;

  const { data, error } = await resend.emails.send({
    from: resendFromAddress(),
    to: [to],
    subject,
    html,
    text: text || undefined,
  });

  if (error) {
    throw new Error(error.message || JSON.stringify(error));
  }

  return { provider: 'resend', id: data?.id };
};

const sendMail = async ({ to, subject, html, text }) => {
  const resendKey = process.env.RESEND_API_KEY?.trim();

  if (resendKey) {
    try {
      await sendViaResend({ to, subject, html, text });
      console.log(`[email] Sent via Resend → ${to}`);
      return { devMode: false, sent: true, provider: 'resend' };
    } catch (err) {
      console.error('[email] Resend failed:', err.message);
      if (!getTransporter()) {
        return { devMode: false, sent: false, error: err.message, provider: 'resend' };
      }
      console.warn('[email] Falling back to SMTP after Resend failure…');
    }
  }

  const transport = getTransporter();

  if (!transport) {
    const error = isSmtpBlockedHost()
      ? resendSetupHint
      : 'Email not configured. Set RESEND_API_KEY or SMTP_HOST, SMTP_USER, SMTP_PASS.';
    console.warn(`[email] ${error}`);
    console.warn(`[email] To: ${to} | Subject: ${subject}`);
    if (text) console.warn(`[email] Body:\n${text}`);
    return { devMode: !isProduction(), sent: false, error };
  }

  try {
    await transport.sendMail({
      from: fromAddress(),
      to,
      subject,
      html,
      text,
    });
    console.log(`[email] Sent via SMTP → ${to}`);
    return { devMode: false, sent: true, provider: 'smtp' };
  } catch (err) {
    const hint =
      err.message?.includes('timeout') ||
      err.message?.includes('ETIMEDOUT') ||
      isSmtpBlockedHost()
        ? resendSetupHint
        : err.message;
    console.error('[email] SMTP failed:', hint);
    console.warn(`[email] To: ${to} | Subject: ${subject}`);
    return { devMode: false, sent: false, error: hint, provider: 'smtp' };
  }
};

const sendVerificationEmail = async ({ email, name, otp, verifyToken }) => {
  const verifyLink = `${frontendUrl()}/verify-email?token=${verifyToken}`;
  const subject = 'Verify your GadKille account';
  const text = `Hi ${name},\n\nYour verification code is: ${otp}\n\nOr verify using this link (expires in 15 minutes):\n${verifyLink}\n\nIf you did not create an account, ignore this email.`;
  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;color:#1E3E45">
      <h2 style="color:#2F6D66">Verify your email</h2>
      <p>Hi ${escapeHtml(name)},</p>
      <p>Use this code to activate your GadKille account:</p>
      <p style="font-size:28px;font-weight:700;letter-spacing:6px;color:#2F6D66">${otp}</p>
      <p>Or <a href="${verifyLink}" style="color:#2F6D66">click here to verify</a> (expires in 15 minutes).</p>
      <p style="font-size:12px;color:#666">If you did not sign up, you can ignore this email.</p>
    </div>
  `;

  return sendMail({ to: email, subject, text, html });
};

const emailLayout = (title, bodyHtml) => `
  <div style="font-family:system-ui,-apple-system,sans-serif;max-width:520px;margin:0 auto;line-height:1.55">
    <div style="background:linear-gradient(135deg,#2F6D66,#1E3E45);padding:20px 24px;border-radius:12px 12px 0 0">
      <p style="margin:0;color:#fff;font-size:18px;font-weight:600">GadKille</p>
      <p style="margin:4px 0 0;color:#EAF2EE;font-size:13px">${escapeHtml(title)}</p>
    </div>
    <div style="padding:24px;background:#2a2a2a;color:#e8e8e8;border:1px solid #3a3a3a;border-top:none;border-radius:0 0 12px 12px">
      ${bodyHtml}
      <p style="margin:24px 0 0;font-size:12px;color:#888">— Team GadKille</p>
    </div>
  </div>
`;

const ctaButton = (href, label) => `
  <p style="margin-top:22px;text-align:center">
    <a href="${href}" style="display:inline-block;background:#2F6D66;color:#fff;text-decoration:none;padding:12px 28px;border-radius:999px;font-weight:600;font-size:14px">${escapeHtml(label)}</a>
  </p>
`;

const summaryBox = (rowsHtml) => `
  <div style="background:#1e3338;border-radius:12px;padding:16px;margin:18px 0;border:1px solid #3d5a5e">
    <p style="margin:0 0 12px;font-size:11px;text-transform:uppercase;color:#6eb5a8;font-weight:700;letter-spacing:0.06em">Booking summary</p>
    ${rowsHtml}
  </div>
`;

const sendAccountCreatedEmail = async ({ email, name }) => {
  const dashboardLink = `${frontendUrl()}/dashboard`;
  const subject = 'Your GadKille account has been created';
  const text = `Hi ${name},\n\nYour GadKille account has been created successfully.\n\nDashboard: ${dashboardLink}\n\n— Team GadKille`;

  const html = emailLayout(
    'Account created',
    `
      <p style="margin:0 0 12px">Hi ${escapeHtml(name)},</p>
      <p style="margin:0 0 12px">Your GadKille account has been <strong style="color:#6eb5a8">created successfully</strong>.</p>
      <p style="margin:0;color:#c8c8c8">Explore forts, book hotels, guides, and cabs from your dashboard.</p>
      ${ctaButton(dashboardLink, 'Go to your dashboard')}
    `
  );

  return sendMail({ to: email, subject, text, html });
};

const sendWelcomeEmail = sendAccountCreatedEmail;

const BOOKING_TYPE_LABELS = {
  stay: { service: 'Hotel / Stay', short: 'hotel stay' },
  guide: { service: 'Fort Guide', short: 'guide booking' },
  vehicle: { service: 'Cab / Vehicle', short: 'cab booking' },
  trip: { service: 'Trip Package', short: 'trip booking' },
};

const formatBookingDate = (date) => {
  try {
    return new Date(date).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return String(date);
  }
};

const buildBookingDetailsHtml = (bookingType, details = {}) => {
  const rows = [];
  if (details.guests) rows.push(['Guests', details.guests]);
  if (bookingType === 'stay' && details.stay) {
    rows.push(['Property', details.stay.name]);
    if (details.stay.pricePerNight) rows.push(['Price/night', `₹${details.stay.pricePerNight}`]);
    if (details.stay.maxGuests) rows.push(['Max guests', details.stay.maxGuests]);
  }
  if (bookingType === 'guide' && details.guide) {
    rows.push(['Guide', details.guide.name]);
    if (details.guide.language) rows.push(['Languages', details.guide.language]);
    if (details.guide.pricing) rows.push(['Pricing', details.guide.pricing]);
  }
  if (bookingType === 'vehicle' && details.vehicle) {
    rows.push(['Vehicle', `${details.vehicle.type || ''} ${details.vehicle.model || ''}`.trim()]);
    if (details.vehicle.driverName) rows.push(['Driver', details.vehicle.driverName]);
    if (details.vehicle.pricePerDay) rows.push(['Price/day', `₹${details.vehicle.pricePerDay}`]);
  }
  if (!rows.length) {
    return '<p style="margin:12px 0 0;color:#aaa;font-size:14px">Full details are saved in your dashboard.</p>';
  }
  return `
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:8px">
      ${rows
        .map(
          ([label, value]) => `
        <tr>
          <td style="padding:8px 0;color:#9aa;border-bottom:1px solid #3d5a5e;width:42%">${escapeHtml(label)}</td>
          <td style="padding:8px 0;font-weight:500;color:#eee;border-bottom:1px solid #3d5a5e">${escapeHtml(String(value))}</td>
        </tr>`
        )
        .join('')}
    </table>
  `;
};

const sendBookingCongratulationsEmail = async ({ email, name, booking }) => {
  const typeInfo = BOOKING_TYPE_LABELS[booking.bookingType] || {
    service: 'Booking',
    short: 'booking',
  };
  const fortName = booking.fortId?.name || 'Fort';
  const fortLocation = booking.fortId?.location || '';
  const dateStr = formatBookingDate(booking.date);
  const dashboardLink = `${frontendUrl()}/dashboard`;

  const subject = `Booking confirmed — ${typeInfo.service} · GadKille`;
  const text = `Hi ${name},\n\nGreat news! Your ${typeInfo.service} request has been accepted and confirmed.\n\nFort: ${fortName}${fortLocation ? `, ${fortLocation}` : ''}\nService: ${typeInfo.service}\nDate: ${dateStr}\n\nView bookings: ${dashboardLink}\n\n— Team GadKille`;

  const summaryRows = `
    <p style="margin:0 0 6px"><strong style="color:#eee">Fort:</strong> <span style="color:#ccc">${escapeHtml(fortName)}${fortLocation ? `, ${escapeHtml(fortLocation)}` : ''}</span></p>
    <p style="margin:0 0 6px"><strong style="color:#eee">Service:</strong> <span style="color:#ccc">${escapeHtml(typeInfo.service)}</span></p>
    <p style="margin:0"><strong style="color:#eee">Date:</strong> <span style="color:#ccc">${escapeHtml(dateStr)}</span></p>
  `;

  const html = emailLayout(
    'Booking confirmed',
    `
      <p style="margin:0 0 12px">Hi ${escapeHtml(name)},</p>
      <p style="margin:0 0 12px">Great news! Your <strong>${escapeHtml(typeInfo.service)}</strong> request has been <strong style="color:#6eb5a8">accepted and confirmed</strong>.</p>
      ${summaryBox(summaryRows)}
      ${buildBookingDetailsHtml(booking.bookingType, booking.details)}
      ${ctaButton(dashboardLink, 'View my bookings')}
    `
  );

  return sendMail({ to: email, subject, text, html });
};

const sendBookingConfirmationEmail = sendBookingCongratulationsEmail;

const sendPasswordResetEmail = async ({ email, name, resetToken }) => {
  const resetLink = `${frontendUrl()}/reset-password?token=${resetToken}`;
  const subject = 'Reset your GadKille password';
  const text = `Hi ${name},\n\nReset your password using this link (expires in 1 hour):\n${resetLink}\n\nIf you did not request this, ignore this email.`;
  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;color:#1E3E45">
      <h2 style="color:#2F6D66">Password reset</h2>
      <p>Hi ${escapeHtml(name)},</p>
      <p><a href="${resetLink}" style="color:#2F6D66">Reset your password</a> (link expires in 1 hour).</p>
      <p style="font-size:12px;color:#666">If you did not request a reset, ignore this email.</p>
    </div>
  `;

  return sendMail({ to: email, subject, text, html });
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendAccountCreatedEmail,
  sendWelcomeEmail,
  sendBookingCongratulationsEmail,
  sendBookingConfirmationEmail,
  getTransporter,
  getEmailConfigStatus,
  isSmtpBlockedHost,
  sendMail,
  frontendUrl,
  isDev,
};
