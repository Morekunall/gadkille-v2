import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import AuthCard, { buttonClass, inputClass, labelClass } from '../../components/auth/AuthCard';
import { useAuth } from '../../context/AuthContext';
import { useUi } from '../../context/UiContext';

const VerifyEmailPage = () => {
  const { verifyEmail, verifyEmailByToken, resendVerification, loading } = useAuth();
  const { language, showToast } = useUi();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const devOtp = location.state?.devOtp;
  const devVerifyLink = location.state?.devVerifyLink;
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [otp, setOtp] = useState('');
  const [linkStatus, setLinkStatus] = useState('idle');

  const t = (en, mr) => (language === 'en' ? en : mr);

  const linkToken = searchParams.get('token');

  useEffect(() => {
    if (!linkToken) return;

    (async () => {
      setLinkStatus('loading');
      const res = await verifyEmailByToken(linkToken);
      if (res.success) {
        setLinkStatus('success');
        showToast(
          'success',
          res.message ||
            t('Registration complete! Check your email for confirmation.', 'नोंदणी पूर्ण! पुष्टीकरणासाठी ई-मेल तपासा.')
        );
        if (res.user) {
          navigate(res.user?.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
        }
      } else {
        setLinkStatus('error');
        showToast('error', res.message);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linkToken]);

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const res = await verifyEmail(email.trim(), otp.trim());
    if (!res.success) {
      showToast('error', res.message);
      return;
    }
    showToast(
      'success',
      res.message ||
        t('Registration complete! Check your email for confirmation.', 'नोंदणी पूर्ण! पुष्टीकरणासाठी ई-मेल तपासा.')
    );
    navigate(res.user?.role === 'admin' ? '/admin' : '/dashboard');
  };

  const handleResend = async () => {
    if (!email.trim()) {
      showToast('error', t('Enter your email first', 'प्रथम ई-मेल प्रविष्ट करा'));
      return;
    }
    const res = await resendVerification(email.trim());
    showToast(res.success ? 'success' : 'error', res.message);
  };

  if (linkStatus === 'loading') {
    return (
      <AuthCard
        title={t('Verifying email…', 'ई-मेल सत्यापित करत आहे…')}
        subtitle={t('Please wait a moment.', 'कृपया थोडा वेळ थांबा.')}
      >
        <p className="text-center text-sm text-gray-500">{t('Checking your link', 'लिंक तपासत आहे')}</p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title={t('Verify your email', 'ई-मेल सत्यापित करा')}
      subtitle={t(
        'Enter the 6-digit code we sent to your inbox.',
        'आम्ही पाठवलेला ६-अंकी कोड प्रविष्ट करा.'
      )}
      footer={
        <Link to="/login" className="font-medium text-primary hover:text-primaryDark">
          {t('Back to login', 'लॉगिनकडे परत')}
        </Link>
      }
    >
      {(devOtp || devVerifyLink) && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <p className="font-medium">
            {t('Email could not be sent — use these for testing:', 'ई-मेल पाठवला नाही — चाचणीसाठी:')}
          </p>
          {devOtp ? <p className="mt-1">OTP: <strong>{devOtp}</strong></p> : null}
          {devVerifyLink ? (
            <a href={devVerifyLink} className="mt-1 block break-all text-primary hover:text-primaryDark">
              {devVerifyLink}
            </a>
          ) : null}
        </div>
      )}
      <form onSubmit={handleOtpSubmit} className="space-y-4">
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
        <div>
          <label className={labelClass}>{t('Verification code', 'सत्यापन कोड')}</label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            required
            placeholder="000000"
            className={`${inputClass} text-center tracking-[0.4em]`}
          />
        </div>
        <button type="submit" disabled={loading} className={buttonClass}>
          {loading ? t('Verifying…', 'सत्यापित करत आहे…') : t('Verify email', 'ई-मेल सत्यापित करा')}
        </button>
        <button
          type="button"
          onClick={handleResend}
          disabled={loading}
          className="w-full text-sm font-medium text-primary hover:text-primaryDark disabled:opacity-60"
        >
          {t('Resend code', 'कोड पुन्हा पाठवा')}
        </button>
      </form>
    </AuthCard>
  );
};

export default VerifyEmailPage;
