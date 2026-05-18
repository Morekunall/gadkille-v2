import { useEffect, useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import AuthCard, { buttonClass, inputClass, labelClass } from '../../components/auth/AuthCard';
import { useAuth } from '../../context/AuthContext';
import { useUi } from '../../context/UiContext';
import { getGoogleAuthUrl } from '../../lib/api';

const LoginPage = () => {
  const { login, loading } = useAuth();
  const { language, showToast } = useUi();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ email: '', password: '' });

  const t = (en, mr) => (language === 'en' ? en : mr);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const error = searchParams.get('error');
    if (!error) return;

    const messages = {
      google_auth_not_configured: t(
        'Google login is not configured. Please contact support or set GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET.',
        'Google लॉगिन सेट अप केलेले नाही. कृपया सपोर्टशी संपर्क करा किंवा GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET सेट करा.'
      ),
      google_auth_failed: t(
        'Google login failed. Please try again.',
        'Google लॉगिन अयशस्वी झाले. कृपया पुन्हा प्रयत्न करा.'
      ),
      google_cancelled: t(
        'Google sign-in was cancelled. Try again when you are ready.',
        'Google साइन-इन रद्द झाले. तयार असाल तेव्हा पुन्हा प्रयत्न करा.'
      ),
      google_no_code: t(
        'Google did not return a login code. Close extra tabs and try again.',
        'Google ने लॉगिन कोड दिला नाही. अतिरिक्त टॅब बंद करून पुन्हा प्रयत्न करा.'
      ),
      google_token: t(
        'Could not verify with Google. On Render: set GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI, and the same redirect URI in Google Cloud (no spaces).',
        'Google सह पडताळणी शक्य झाली नाही. Render वर GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI आणि Google Cloud मधील redirect URI जुळवा.'
      ),
      google_profile: t(
        'Could not read your email from Google. Check that your Google account has an email and try again.',
        'Google कडून ई-मेल मिळाला नाही. खात्यात ई-मेल असल्याची खात्री करून पुन्हा प्रयत्न करा.'
      ),
      google_server: t(
        'Server error during Google login. Check /api/auth/oauth-health on your API — set JWT_SECRET and MongoDB Atlas MONGO_URI on Render, then redeploy.',
        'Google लॉगिन सर्व्हर त्रुटी. Render वर JWT_SECRET आणि Atlas MONGO_URI सेट करा.'
      ),
      google_db: t(
        'Database error during Google login. On Render, set MONGO_URI to your MongoDB Atlas connection string (not localhost) and allow access from anywhere (0.0.0.0/0).',
        'डेटाबेस त्रुटी. Render वर MONGO_URI Atlas connection string असावा (localhost नाही).'
      ),
      google_jwt: t(
        'Could not create login token. On Render, set JWT_SECRET to a long random string (no quotes) and redeploy.',
        'लॉगिन टोकन तयार झाला नाही. Render वर JWT_SECRET सेट करा.'
      ),
      google_bad_state: t(
        'Google login session was rejected. Use one browser tab, redeploy after changing secrets, and on Render re-paste JWT_SECRET with no quotes or hidden characters.',
        'Google सत्र नाकारले. एक टॅब वापरा; Render वर JWT_SECRET पुन्हा चिकटवा (अवैध वर्ण नाहीत याची खात्री करा).'
      ),
    };

    showToast('error', messages[error] || t('Unexpected login error. Please try again.', 'अनपेक्षित लॉगिन त्रुटी. कृपया पुन्हा प्रयत्न करा.'));
    navigate('/login', { replace: true });
  }, [searchParams, showToast, navigate, t]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await login(form.email.trim(), form.password);
    if (!res.success) {
      if (res.code === 'EMAIL_NOT_VERIFIED') {
        showToast('error', res.message);
        navigate(`/verify-email?email=${encodeURIComponent(res.email || form.email.trim())}`);
        return;
      }
      showToast('error', res.message);
      return;
    }
    showToast('success', t('Welcome back!', 'पुन्हा स्वागत आहे!'));
    navigate(res.user?.role === 'admin' ? '/admin' : '/dashboard');
  };

  return (
    <AuthCard
      title={t('Login to your journey', 'आपल्या प्रवासात प्रवेश करा')}
      subtitle={t(
        'Access your fort bookings, guides and saved routes.',
        'किल्ले बुकिंग, मार्गदर्शक आणि जतन केलेले मार्ग पहा.'
      )}
      footer={
        <span>
          {t('New here?', 'नवीन आहात?')}{' '}
          <Link to="/register" className="font-medium text-primary hover:text-primaryDark">
            {t('Create an account', 'खाते तयार करा')}
          </Link>
        </span>
      }
    >
      <div className="space-y-4">
        <a
          href={getGoogleAuthUrl()}
          className="flex items-center justify-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-soft transition hover:bg-slate-100"
        >
          <img
            src="https://www.svgrepo.com/show/355037/google.svg"
            alt="Google"
            className="h-5 w-5"
          />
          {t('Continue with Google', 'Google ने सुरू करा')}
        </a>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="h-px flex-1 bg-gray-200" />
          <span>{t('OR', 'किंवा')}</span>
          <span className="h-px flex-1 bg-gray-200" />
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
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
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">{t('Password', 'पासवर्ड')}</label>
            <Link
              to="/forgot-password"
              className="text-xs font-medium text-primary hover:text-primaryDark"
            >
              {t('Forgot password?', 'पासवर्ड विसरलात?')}
            </Link>
          </div>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            autoComplete="current-password"
            className={inputClass}
          />
        </div>
        <button type="submit" disabled={loading} className={buttonClass}>
          {loading ? t('Signing in…', 'लॉगिन चालू…') : t('Login', 'लॉगिन')}
        </button>
      </form>
    </AuthCard>
  );
};

export default LoginPage;
