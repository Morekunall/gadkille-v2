import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AuthCard, { buttonClass, inputClass, labelClass } from '../../components/auth/AuthCard';
import { useAuth } from '../../context/AuthContext';
import { useUi } from '../../context/UiContext';
import { validatePassword } from '../../lib/validation';

const ResetPasswordPage = () => {
  const { resetPassword, loading } = useAuth();
  const { language, showToast } = useUi();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const t = (en, mr) => (language === 'en' ? en : mr);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      showToast('error', t('Invalid reset link', 'अवैध रीसेट लिंक'));
      return;
    }
    const pwdError = validatePassword(password, language);
    if (pwdError) {
      showToast('error', pwdError);
      return;
    }
    if (password !== confirm) {
      showToast('error', t('Passwords do not match', 'पासवर्ड जुळत नाहीत'));
      return;
    }
    const res = await resetPassword(token, password);
    if (!res.success) {
      showToast('error', res.message);
      return;
    }
    showToast('success', res.message);
    navigate('/login', { replace: true });
  };

  if (!token) {
    return (
      <AuthCard
        title={t('Invalid link', 'अवैध लिंक')}
        subtitle={t('Request a new password reset from the login page.', 'लॉगिन पृष्ठावरून नवीन रीसेट विनंती करा.')}
        footer={
          <Link to="/forgot-password" className="font-medium text-primary hover:text-primaryDark">
            {t('Request reset', 'रीसेट विनंती')}
          </Link>
        }
      />
    );
  }

  return (
    <AuthCard
      title={t('Set new password', 'नवीन पासवर्ड सेट करा')}
      subtitle={t('Choose a strong password for your account.', 'मजबूत पासवर्ड निवडा.')}
      footer={
        <Link to="/login" className="font-medium text-primary hover:text-primaryDark">
          {t('Back to login', 'लॉगिनकडे परत')}
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>{t('New password', 'नवीन पासवर्ड')}</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            className={inputClass}
          />
          <p className="mt-1 text-xs text-gray-500">
            {t('8+ chars with upper, lower, and a number', '८+ अक्षरे, मोठे/लहान आणि अंक')}
          </p>
        </div>
        <div>
          <label className={labelClass}>{t('Confirm password', 'पासवर्ड पुष्टी')}</label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            className={inputClass}
          />
        </div>
        <button type="submit" disabled={loading} className={buttonClass}>
          {loading ? t('Updating…', 'अपडेट करत आहे…') : t('Update password', 'पासवर्ड अपडेट करा')}
        </button>
      </form>
    </AuthCard>
  );
};

export default ResetPasswordPage;
