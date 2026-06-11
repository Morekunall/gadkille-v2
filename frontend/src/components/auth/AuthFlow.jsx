import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useUi } from '../../context/UiContext';
import { getGoogleAuthUrl } from '../../lib/api';
import { validateEmail, validatePassword } from '../../lib/validation';
import { buttonClass, inputClass, labelClass } from './AuthCard';

const STEP_NUM = {
  email: 1,
  password: 2,
  profile: 2,
  'signup-auth': 3,
  verify: 3,
};

function generateCodeSignupPassword() {
  const part = crypto.randomUUID().replace(/-/g, '').slice(0, 10);
  return `Gk${part}9Z`;
}

function GoogleButton({ label }) {
  return (
    <a
      href={getGoogleAuthUrl()}
      className="flex w-full items-center justify-center gap-3 rounded-full border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-soft transition hover:border-primary/30 hover:bg-softBg"
    >
      <img src="https://www.svgrepo.com/show/355037/google.svg" alt="" className="h-5 w-5" aria-hidden />
      {label}
    </a>
  );
}

function EmailChip({ email, onChange, t }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-2 rounded-xl border border-primary/15 bg-softBg/80 px-3 py-2">
      <span className="truncate text-sm text-gray-700">{email}</span>
      <button
        type="button"
        onClick={onChange}
        className="shrink-0 text-xs font-semibold text-primary hover:text-primaryDark"
      >
        {t('Change', 'बदला')}
      </button>
    </div>
  );
}

function StepProgress({ step, t }) {
  const current = STEP_NUM[step] || 1;
  return (
    <div className="mb-5 flex items-center gap-2">
      {[1, 2, 3].map((n) => (
        <div
          key={n}
          className={`h-1.5 flex-1 rounded-full transition-colors ${
            n <= current ? 'bg-primary' : 'bg-gray-200'
          }`}
        />
      ))}
      <span className="sr-only">
        {t(`Step ${current} of 3`, `पायरी ${current} पैकी ३`)}
      </span>
    </div>
  );
}

function OrDivider({ t }) {
  return (
    <div className="flex items-center gap-3 py-1 text-xs text-gray-400">
      <span className="h-px flex-1 bg-gray-200" />
      <span className="uppercase tracking-wider">{t('or', 'किंवा')}</span>
      <span className="h-px flex-1 bg-gray-200" />
    </div>
  );
}

export default function AuthFlow() {
  const navigate = useNavigate();
  const { checkEmail, login, register, verifyEmail, resendVerification, loading } = useAuth();
  const { language, showToast } = useUi();

  const t = (en, mr) => (language === 'en' ? en : mr);

  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [signupMethod, setSignupMethod] = useState('password');
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [devVerifyLink, setDevVerifyLink] = useState('');
  const [busy, setBusy] = useState(false);

  const goEmail = () => {
    setStep('email');
    setPassword('');
    setOtp('');
  };

  const finishLogin = (user) => {
    showToast('success', t('Welcome back!', 'पुन्हा स्वागत आहे!'));
    navigate(user?.role === 'admin' ? '/admin' : '/dashboard');
  };

  const handleEmailContinue = async (e) => {
    e.preventDefault();
    const emailErr = validateEmail(email, language);
    if (emailErr) {
      showToast('error', emailErr);
      return;
    }

    setBusy(true);
    const res = await checkEmail(email.trim());
    setBusy(false);

    if (!res.success) {
      showToast('error', res.message);
      return;
    }

    if (res.legacyMode) {
      setStep('password');
      showToast(
        'success',
        t(
          'Enter your password to sign in, or use “Create account” below if you are new.',
          'लॉगिनसाठी पासवर्ड टाका, नवीन असाल तर “खाते तयार करा” वापरा.'
        )
      );
      return;
    }

    if (res.exists && res.verified) {
      setStep('password');
      return;
    }

    if (res.exists && !res.verified) {
      setStep('verify');
      showToast(
        'success',
        t('Enter the code we sent to your email to finish signing up.', 'नोंदणी पूर्ण करण्यासाठी ई-मेलवरील कोड टाका.')
      );
      return;
    }

    setStep('profile');
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    const res = await login(email.trim(), password.trim());
    if (!res.success) {
      if (res.code === 'EMAIL_NOT_VERIFIED') {
        showToast('error', res.message);
        setStep('verify');
        return;
      }
      showToast('error', res.message);
      return;
    }
    finishLogin(res.user);
  };

  const handleProfileContinue = (e) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      showToast('error', t('Please enter your first and last name.', 'प्रथम आणि आडनाव टाका.'));
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, '').length < 10) {
      showToast('error', t('Please enter a valid 10-digit mobile number.', 'वैध १० अंकी मोबाईल नंबर टाका.'));
      return;
    }
    setStep('signup-auth');
  };

  const runRegister = async (pwd) => {
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    return register({
      name: fullName,
      email: email.trim(),
      phone: phone.trim(),
      password: pwd,
    });
  };

  const handleSignupAuth = async (e) => {
    e.preventDefault();

    if (signupMethod === 'password') {
      const pwdErr = validatePassword(password, language);
      if (pwdErr) {
        showToast('error', pwdErr);
        return;
      }
    }

    const pwd = signupMethod === 'code' ? generateCodeSignupPassword() : password;
    const res = await runRegister(pwd);

    if (!res.success) {
      showToast('error', res.message);
      return;
    }

    if (res.devOtp) setDevOtp(res.devOtp);
    if (res.devVerifyLink) setDevVerifyLink(res.devVerifyLink);

    showToast(
      'success',
      res.devOtp
        ? `${res.message} ${t('Dev code:', 'चाचणी कोड:')} ${res.devOtp}`
        : res.message || t('Check your email for the verification code.', 'सत्यापन कोडसाठी ई-मेल तपासा.')
    );
    setStep('verify');
  };

  const handleSendCodeOnly = async () => {
    setSignupMethod('code');
    const pwd = generateCodeSignupPassword();
    const res = await runRegister(pwd);
    if (!res.success) {
      showToast('error', res.message);
      return;
    }
    if (res.devOtp) setDevOtp(res.devOtp);
    if (res.devVerifyLink) setDevVerifyLink(res.devVerifyLink);
    showToast(
      'success',
      res.message || t('We sent a 6-digit code to your email.', 'आम्ही ६-अंकी कोड ई-मेलवर पाठवला.')
    );
    setStep('verify');
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const res = await verifyEmail(email.trim(), otp.trim());
    if (!res.success) {
      showToast('error', res.message);
      return;
    }
    showToast(
      'success',
      res.message || t('Registration complete! Check your email for confirmation.', 'नोंदणी पूर्ण! पुष्टीकरणासाठी ई-मेल तपासा.')
    );
    navigate(res.user?.role === 'admin' ? '/admin' : '/dashboard');
  };

  const handleResend = async () => {
    const res = await resendVerification(email.trim());
    showToast(res.success ? 'success' : 'error', res.message);
  };

  const titles = {
    email: t('Sign in to GadKille', 'गडकिल्ले मध्ये साइन इन'),
    password: t('Enter your password', 'पासवर्ड टाका'),
    profile: t('Create your account', 'खाते तयार करा'),
    'signup-auth': t('Secure your account', 'खाते सुरक्षित करा'),
    verify: t('Check your email', 'ई-मेल तपासा'),
  };

  const subtitles = {
    email: t(
      'Continue with Google or use your email to get started.',
      'Google ने सुरू करा किंवा ई-मेल वापरा.'
    ),
    password: t('Welcome back — enter the password for this account.', 'पुन्हा स्वागत — पासवर्ड टाका.'),
    profile: t('Tell us a bit about yourself for bookings and updates.', 'बुकिंग आणि अपडेटसाठी माहिती द्या.'),
    'signup-auth': t(
      'Choose a password or sign in with a one-time code from your email.',
      'पासवर्ड ठेवा किंवा ई-मेलवरील एक-वेळ कोड वापरा.'
    ),
    verify: t('Enter the 6-digit code we sent to your inbox.', 'आम्ही पाठवलेला ६-अंकी कोड टाका.'),
  };

  const isDisabled = loading || busy;

  const goBack = () => {
    if (step === 'password' || step === 'profile') goEmail();
    else if (step === 'signup-auth') setStep('profile');
    else if (step === 'verify') setStep(firstName.trim() ? 'signup-auth' : 'password');
  };

  return (
    <div className="space-y-1">
      {step === 'email' && (
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primaryDark text-lg font-bold text-white shadow-soft">
            G
          </div>
          <div>
            <p className="text-sm font-semibold text-primaryDark">GadKille</p>
            <p className="text-xs text-gray-500">
              {t('Fort exploration & trips', 'किल्ले भ्रमंती आणि ट्रिप')}
            </p>
          </div>
        </div>
      )}

      {step !== 'email' && (
        <button
          type="button"
          onClick={goBack}
          className="mb-1 flex items-center gap-1 text-sm font-medium text-gray-500 transition hover:text-primaryDark"
        >
          <span aria-hidden>←</span>
          {t('Back', 'मागे')}
        </button>
      )}
      {step !== 'email' && <StepProgress step={step} t={t} />}

      <h2 className="text-lg font-semibold text-primaryDark">{titles[step]}</h2>
      <p className="mb-4 text-sm text-gray-600">{subtitles[step]}</p>

      {step !== 'email' && <EmailChip email={email.trim()} onChange={goEmail} t={t} />}

      {step === 'email' && (
        <div className="space-y-4">
          <GoogleButton label={t('Continue with Google', 'Google ने सुरू करा')} />
          <OrDivider t={t} />
          <form onSubmit={handleEmailContinue} className="space-y-4">
            <div>
              <label className={labelClass} htmlFor="auth-email">
                {t('Email address', 'ई-मेल पत्ता')}
              </label>
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder={t('you@example.com', 'you@example.com')}
                className={inputClass}
              />
            </div>
            <button type="submit" disabled={isDisabled} className={buttonClass}>
              {isDisabled ? t('Please wait…', 'प्रतीक्षा…') : t('Continue', 'पुढे जा')}
            </button>
          </form>
        </div>
      )}

      {step === 'password' && (
        <form onSubmit={handlePasswordLogin} className="space-y-4">
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700" htmlFor="auth-password">
                {t('Password', 'पासवर्ड')}
              </label>
              <Link to="/forgot-password" className="text-xs font-medium text-primary hover:text-primaryDark">
                {t('Forgot password?', 'पासवर्ड विसरलात?')}
              </Link>
            </div>
            <input
              id="auth-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className={inputClass}
            />
          </div>
          <button type="submit" disabled={isDisabled} className={buttonClass}>
            {isDisabled ? t('Signing in…', 'लॉगिन…') : t('Login', 'लॉगिन')}
          </button>
          <button
            type="button"
            onClick={() => setStep('profile')}
            className="w-full text-center text-sm font-medium text-primary hover:text-primaryDark"
          >
            {t('Create account', 'खाते तयार करा')}
          </button>
        </form>
      )}

      {step === 'profile' && (
        <form onSubmit={handleProfileContinue} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass} htmlFor="auth-first">
                {t('First name', 'पहिले नाव')}
              </label>
              <input
                id="auth-first"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                autoComplete="given-name"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="auth-last">
                {t('Last name', 'आडनाव')}
              </label>
              <input
                id="auth-last"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                autoComplete="family-name"
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className={labelClass} htmlFor="auth-phone">
              {t('Phone number', 'मोबाईल नंबर')}
            </label>
            <input
              id="auth-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              autoComplete="tel"
              placeholder={t('10-digit mobile', '१० अंकी मोबाईल')}
              className={inputClass}
            />
          </div>
          <button type="submit" disabled={isDisabled} className={buttonClass}>
            {t('Continue', 'पुढे जा')}
          </button>
        </form>
      )}

      {step === 'signup-auth' && (
        <div className="space-y-4">
          <div className="flex rounded-full border border-gray-200 bg-softBg/60 p-1">
            <button
              type="button"
              onClick={() => setSignupMethod('password')}
              className={`flex-1 rounded-full py-2 text-xs font-semibold transition ${
                signupMethod === 'password'
                  ? 'bg-white text-primaryDark shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t('Password', 'पासवर्ड')}
            </button>
            <button
              type="button"
              onClick={() => setSignupMethod('code')}
              className={`flex-1 rounded-full py-2 text-xs font-semibold transition ${
                signupMethod === 'code'
                  ? 'bg-white text-primaryDark shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t('Email code', 'ई-मेल कोड')}
            </button>
          </div>

          {signupMethod === 'password' ? (
            <form onSubmit={handleSignupAuth} className="space-y-4">
              <div>
                <label className={labelClass} htmlFor="auth-new-password">
                  {t('Create password', 'पासवर्ड तयार करा')}
                </label>
                <input
                  id="auth-new-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className={inputClass}
                />
                <p className="mt-1 text-xs text-gray-500">
                  {t('8+ characters with upper, lower, and a number', '८+ अक्षरे, मोठे/लहान आणि अंक')}
                </p>
              </div>
              <button type="submit" disabled={isDisabled} className={buttonClass}>
                {isDisabled ? t('Creating account…', 'खाते तयार…') : t('Continue', 'पुढे जा')}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <p className="rounded-xl border border-primary/10 bg-softBg/50 px-4 py-3 text-sm text-gray-600">
                {t(
                  'We will email you a 6-digit code. No password needed — use the code to sign in.',
                  'आम्ही ६-अंकी कोड पाठवू. पासवर्ड नको — कोडने साइन इन करा.'
                )}
              </p>
              <button type="button" onClick={handleSendCodeOnly} disabled={isDisabled} className={buttonClass}>
                {isDisabled ? t('Sending code…', 'कोड पाठवत आहे…') : t('Send code to email', 'ई-मेलवर कोड पाठवा')}
              </button>
            </div>
          )}
        </div>
      )}

      {step === 'verify' && (
        <div className="space-y-4">
          {(devOtp || devVerifyLink) && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
              <p className="font-medium">{t('Testing — use this code:', 'चाचणी — हा कोड:')}</p>
              {devOtp ? (
                <p className="mt-1 font-mono text-lg tracking-widest">{devOtp}</p>
              ) : null}
              {devVerifyLink ? (
                <a href={devVerifyLink} className="mt-1 block break-all text-primary">
                  {devVerifyLink}
                </a>
              ) : null}
            </div>
          )}
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className={labelClass} htmlFor="auth-otp">
                {t('6-digit code', '६-अंकी कोड')}
              </label>
              <input
                id="auth-otp"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                required
                placeholder="000000"
                className={`${inputClass} text-center text-lg tracking-[0.35em]`}
              />
            </div>
            <button type="submit" disabled={isDisabled} className={buttonClass}>
              {isDisabled ? t('Verifying…', 'सत्यापित…') : t('Verify & sign in', 'सत्यापित करा आणि साइन इन')}
            </button>
            <button
              type="button"
              onClick={handleResend}
              disabled={isDisabled}
              className="w-full text-sm font-medium text-primary hover:text-primaryDark disabled:opacity-60"
            >
              {t('Resend code', 'कोड पुन्हा पाठवा')}
            </button>
          </form>
        </div>
      )}

      {step === 'email' && (
        <p className="pt-2 text-center text-xs text-gray-500">
          {t('By continuing you agree to our', 'पुढे जाऊन आपण सहमत आहात')}{' '}
          <Link to="/contact" className="text-primary hover:text-primaryDark">
            {t('terms & support', 'अटी आणि सपोर्ट')}
          </Link>
        </p>
      )}
    </div>
  );
}
