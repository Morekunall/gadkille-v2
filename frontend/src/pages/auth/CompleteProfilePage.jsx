import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AuthCard, { buttonClass, inputClass, labelClass } from '../../components/auth/AuthCard';
import { useAuth } from '../../context/AuthContext';
import { useUi } from '../../context/UiContext';

const CompleteProfilePage = () => {
  const { user, loading, authenticateWithToken, completeProfile } = useAuth();
  const { language, showToast } = useUi();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [phone, setPhone] = useState('');
  const [bootstrapping, setBootstrapping] = useState(true);

  const t = (en, mr) => (language === 'en' ? en : mr);
  const isNew = searchParams.get('new') === '1';

  useEffect(() => {
    const token = searchParams.get('token');
    (async () => {
      if (token) {
        await authenticateWithToken(token);
      }
      setBootstrapping(false);
    })();
  }, [searchParams, authenticateWithToken]);

  useEffect(() => {
    if (bootstrapping) return;
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    if (user.phone && !user.needsPhone) {
      navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    }
  }, [user, bootstrapping, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await completeProfile(phone.trim());
    if (!res.success) {
      showToast('error', res.message);
      return;
    }
    if (res.accountEmailSent === false) {
      showToast(
        'error',
        res.accountEmailError ||
          t(
            'Profile saved, but confirmation email was not sent. Check spam or contact support.',
            'प्रोफाइल सेव्ह झाली, पण पुष्टी ई-मेल पाठवला नाही. स्पॅम तपासा.'
          )
      );
    } else {
      showToast(
        'success',
        t(
          'Registration complete! Check your email for account confirmation.',
          'नोंदणी पूर्ण! खाते पुष्टीकरणासाठी ई-मेल तपासा.'
        )
      );
    }
    navigate(res.user?.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
  };

  if (bootstrapping || !user) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-gray-500">
        {t('Loading…', 'लोड होत आहे…')}
      </div>
    );
  }

  return (
    <AuthCard
      title={t('One last step', 'शेवटची पायरी')}
      subtitle={t(
        isNew
          ? 'Your account was created. After you add your mobile number, we will email you a confirmation (check inbox and spam).'
          : 'Add your mobile number so our team can reach you for fort bookings and trip updates.',
        isNew
          ? 'खाते तयार झाले. मोबाईल नंबर नंतर पुष्टी ई-मेल येईल (इनबॉक्स आणि स्पॅम तपासा).'
          : 'बुकिंग आणि प्रवास अपडेटसाठी मोबाईल नंबर जोडा.'
      )}
      footer={
        <span className="text-sm text-gray-500">
          {t('Signed in as', 'लॉगिन')}: <strong>{user.email}</strong>
        </span>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>{t('Mobile number', 'मोबाईल नंबर')} *</label>
          <input
            type="tel"
            name="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            minLength={10}
            maxLength={15}
            placeholder={t('e.g. 9876543210', 'उदा. 9876543210')}
            autoComplete="tel"
            className={inputClass}
          />
          <p className="mt-1 text-xs text-gray-500">
            {t(
              'Used only for booking confirmations and admin support.',
              'फक्त बुकिंग आणि सपोर्टसाठी वापरले जाईल.'
            )}
          </p>
        </div>
        <button type="submit" disabled={loading} className={buttonClass}>
          {loading ? t('Saving…', 'जतन करत आहे…') : t('Complete registration', 'नोंदणी पूर्ण करा')}
        </button>
      </form>
    </AuthCard>
  );
};

export default CompleteProfilePage;
