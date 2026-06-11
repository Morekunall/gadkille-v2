import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthCard, { buttonClass, inputClass, labelClass } from '../../components/auth/AuthCard';
import { useAuth } from '../../context/AuthContext';
import { useUi } from '../../context/UiContext';
import { validateEmail } from '../../lib/validation';

const ForgotPasswordPage = () => {
  const { forgotPassword, loading } = useAuth();
  const { language, showToast } = useUi();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [devResetLink, setDevResetLink] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [emailWasSent, setEmailWasSent] = useState(false);

  const t = (en, mr) => (language === 'en' ? en : mr);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailError = validateEmail(email, language);
    if (emailError) {
      showToast('error', emailError);
      return;
    }
    const res = await forgotPassword(email.trim());
    if (!res.success) {
      showToast('error', res.message);
      return;
    }
    setSent(true);
    setStatusMessage(res.message);
    setEmailWasSent(Boolean(res.emailSent));
    if (res.devResetLink) setDevResetLink(res.devResetLink);
    showToast(res.emailSent ? 'success' : 'error', res.message);
  };

  return (
    <AuthCard
      title={t('Forgot password?', 'पासवर्ड विसरलात?')}
      subtitle={t(
        'We will email you a secure link to reset your password.',
        'पासवर्ड रीसेट करण्यासाठी सुरक्षित लिंक पाठवू.'
      )}
      footer={
        <Link to="/login" className="font-medium text-primary hover:text-primaryDark">
          {t('Back to login', 'लॉगिनकडे परत')}
        </Link>
      }
    >
      {sent ? (
        <div className="space-y-3">
          <p
            className={`rounded-xl px-4 py-3 text-sm ${
              emailWasSent
                ? 'bg-green-50 text-green-900 ring-1 ring-green-200'
                : 'bg-softBg text-gray-700'
            }`}
          >
            {statusMessage}
          </p>
          {!emailWasSent && !devResetLink ? (
            <p className="text-xs text-gray-500">
              {t(
                'Tip: Use the exact email you registered with. No email means that address may not have an account yet.',
                'टिप: नोंदणी केलेला त्याच ई-मेल वापरा. खाते नसेल तर ई-मेल येणार नाही.'
              )}
            </p>
          ) : null}
          {devResetLink ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm">
              <p className="font-medium text-amber-900">
                {t('Development reset link (email not sent):', 'विकास लिंक (ई-मेल पाठवला नाही):')}
              </p>
              <a
                href={devResetLink}
                className="mt-2 block break-all text-primary hover:text-primaryDark"
              >
                {devResetLink}
              </a>
            </div>
          ) : null}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>{t('Email', 'ई-मेल')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className={inputClass}
            />
          </div>
          <button type="submit" disabled={loading} className={buttonClass}>
            {loading ? t('Sending…', 'पाठवत आहे…') : t('Send reset link', 'रीसेट लिंक पाठवा')}
          </button>
        </form>
      )}
    </AuthCard>
  );
};

export default ForgotPasswordPage;
