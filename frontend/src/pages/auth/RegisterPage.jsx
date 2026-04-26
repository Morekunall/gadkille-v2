import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useUi } from '../../context/UiContext';

const RegisterPage = () => {
  const { register, loading } = useAuth();
  const { language, showToast } = useUi();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await register(form);
    if (!res.success) {
      showToast('error', res.message);
      return;
    }
    showToast('success', language === 'en' ? 'Account created!' : 'खाते तयार झाले!');
    navigate('/dashboard');
  };

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 px-4 py-10">
      <div className="rounded-3xl bg-white p-6 shadow-soft">
        <h1 className="text-lg font-semibold text-primaryDark">
          {language === 'en' ? 'Create your Gadkille account' : 'आपले गडकिल्ले खाते तयार करा'}
        </h1>
        <p className="mt-1 text-xs text-gray-500">
          {language === 'en'
            ? 'Save forts, manage bookings and access local experiences.'
            : 'किल्ले सेव्ह करा, बुकिंग्स सांभाळा आणि स्थानिक अनुभवांचा आनंद घ्या.'}
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-xs">
          <div>
            <label className="mb-1 block text-gray-700">
              {language === 'en' ? 'Full name' : 'पूर्ण नाव'}
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-gray-200 bg-softBg px-3 py-2 focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-gray-700">
              {language === 'en' ? 'Email' : 'ई-मेल'}
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-gray-200 bg-softBg px-3 py-2 focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-gray-700">
              {language === 'en' ? 'Contact number' : 'मोबाईल नंबर'}
            </label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder={language === 'en' ? 'Optional' : 'ऐच्छिक'}
              className="w-full rounded-xl border border-gray-200 bg-softBg px-3 py-2 focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-gray-700">
              {language === 'en' ? 'Password' : 'पासवर्ड'}
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              minLength={6}
              required
              className="w-full rounded-xl border border-gray-200 bg-softBg px-3 py-2 focus:border-primary focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-full bg-primary py-2 text-xs font-semibold text-white shadow-soft hover:bg-primaryDark disabled:opacity-60"
          >
            {loading
              ? language === 'en'
                ? 'Creating...'
                : 'तयार करत आहोत...'
              : language === 'en'
              ? 'Sign up'
              : 'नोंदणी'}
          </button>
        </form>

        <p className="mt-3 text-[11px] text-gray-500">
          {language === 'en' ? 'Already have an account?' : 'आधीपासून खाते आहे?'}{' '}
          <Link to="/login" className="text-primary hover:text-primaryDark">
            {language === 'en' ? 'Login' : 'लॉगिन'}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;

