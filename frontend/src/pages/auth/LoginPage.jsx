import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AuthCard from '../../components/auth/AuthCard';
import AuthFlow from '../../components/auth/AuthFlow';
import { useAuthOAuthCallback } from '../../hooks/useAuthOAuthCallback';
import { useUi } from '../../context/UiContext';

const GOOGLE_ERROR_MESSAGES = {
  google_auth_not_configured: [
    'Google login is not configured. Please contact support.',
    'Google लॉगिन सेट अप केलेले नाही. कृपया सपोर्टशी संपर्क करा.',
  ],
  google_auth_failed: ['Google login failed. Please try again.', 'Google लॉगिन अयशस्वी. पुन्हा प्रयत्न करा.'],
  google_cancelled: [
    'Google sign-in was cancelled.',
    'Google साइन-इन रद्द झाले.',
  ],
  google_no_code: [
    'Google did not return a login code. Try again.',
    'Google ने लॉगिन कोड दिला नाही. पुन्हा प्रयत्न करा.',
  ],
  google_token: [
    'Could not verify with Google. Check server OAuth settings.',
    'Google सह पडताळणी शक्य झाली नाही.',
  ],
  google_profile: [
    'Could not read your email from Google.',
    'Google कडून ई-मेल मिळाला नाही.',
  ],
  google_server: ['Server error during Google login.', 'Google लॉगिन सर्व्हर त्रुटी.'],
  google_db: ['Database error during Google login.', 'डेटाबेस त्रुटी.'],
  google_jwt: ['Could not create login token.', 'लॉगिन टोकन तयार झाला नाही.'],
  google_bad_state: ['Google login session was rejected. Try again in one tab.', 'Google सत्र नाकारले.'],
};

const LoginPage = () => {
  const { language, showToast } = useUi();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useAuthOAuthCallback();

  const t = (en, mr) => (language === 'en' ? en : mr);

  useEffect(() => {
    if (searchParams.get('token')) return;

    const error = searchParams.get('error');
    if (!error) return;

    const pair = GOOGLE_ERROR_MESSAGES[error];
    const message = pair
      ? t(pair[0], pair[1])
      : t('Unexpected login error. Please try again.', 'अनपेक्षित लॉगिन त्रुटी.');

    showToast('error', message);
    navigate('/login', { replace: true });
  }, [searchParams, showToast, navigate, language]);

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-gradient-to-b from-softBg via-white to-softBg/40">
      <AuthCard>
        <AuthFlow />
      </AuthCard>
    </div>
  );
};

export default LoginPage;
