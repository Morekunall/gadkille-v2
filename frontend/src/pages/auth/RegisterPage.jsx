import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthCard, { buttonClass, inputClass, labelClass } from '../../components/auth/AuthCard';
import { useAuth } from '../../context/AuthContext';
import { useUi } from '../../context/UiContext';
import { validateEmail, validatePassword } from '../../lib/validation';

const RegisterPage = () => {
  const { register, loading } = useAuth();
  const { language, showToast } = useUi();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });

  const t = (en, mr) => (language === 'en' ? en : mr);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailError = validateEmail(form.email, language);
    if (emailError) {
      showToast('error', emailError);
      return;
    }
    if (!form.phone.trim()) {
      showToast('error', t('Please enter your mobile number.', 'कृपया मोबाईल नंबर टाका.'));
      return;
    }
    const pwdError = validatePassword(form.password, language);
    if (pwdError) {
      showToast('error', pwdError);
      return;
    }

    const res = await register({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      password: form.password,
    });

    if (!res.success) {
      showToast('error', res.message);
      return;
    }

    showToast(
      'success',
      res.devOtp
        ? `${res.message} Dev code: ${res.devOtp}`
        : res.message ||
            t('Check your email for the verification code.', 'सत्यापन कोडसाठी ई-मेल तपासा.')
    );
    navigate(`/verify-email?email=${encodeURIComponent(res.email)}`, {
      state: { devOtp: res.devOtp, devVerifyLink: res.devVerifyLink },
    });
  };

  return (
    <AuthCard
      title={t('Create your Gadkille account', 'आपले गडकिल्ले खाते तयार करा')}
      subtitle={t(
        'Save forts, manage bookings and access local experiences.',
        'किल्ले सेव्ह करा, बुकिंग्स सांभाळा आणि स्थानिक अनुभवांचा आनंद घ्या.'
      )}
      footer={
        <span>
          {t('Already have an account?', 'आधीपासून खाते आहे?')}{' '}
          <Link to="/login" className="font-medium text-primary hover:text-primaryDark">
            {t('Login', 'लॉगिन')}
          </Link>
        </span>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>{t('Full name', 'पूर्ण नाव')}</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            minLength={2}
            autoComplete="name"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>{t('Email', 'ई-मेल')}</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            autoComplete="email"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>{t('Contact number', 'मोबाईल नंबर')}</label>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            required
            minLength={10}
            maxLength={15}
            placeholder={t('10-digit mobile', '१० अंकी मोबाईल')}
            autoComplete="tel"
            className={inputClass}
          />
          <p className="mt-1 text-xs text-gray-500">
            {t('So admins can contact you about bookings.', 'बुकिंगसाठी संपर्कासाठी.')}
          </p>
        </div>
        <div>
          <label className={labelClass}>{t('Password', 'पासवर्ड')}</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            minLength={8}
            autoComplete="new-password"
            className={inputClass}
          />
          <p className="mt-1 text-xs text-gray-500">
            {t('8+ chars with upper, lower, and a number', '८+ अक्षरे, मोठे/लहान आणि अंक')}
          </p>
        </div>
        <button type="submit" disabled={loading} className={buttonClass}>
          {loading ? t('Creating…', 'तयार करत आहोत…') : t('Sign up', 'नोंदणी')}
        </button>
      </form>
    </AuthCard>
  );
};

export default RegisterPage;
