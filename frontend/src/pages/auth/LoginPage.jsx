import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useUi } from '../../context/UiContext';

const LoginPage = () => {
  const { login, loading } = useAuth();
  const { language, showToast } = useUi();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await login(form.email, form.password);
    if (!res.success) {
      showToast('error', res.message);
      return;
    }
    showToast('success', language === 'en' ? 'Welcome back!' : 'पुन्हा स्वागत आहे!');
    navigate(res.user?.role === 'admin' ? '/admin' : '/dashboard');
  };

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 px-4 py-10">
      <div className="rounded-3xl bg-white p-6 shadow-soft">
        <h1 className="text-lg font-semibold text-primaryDark">
          {language === 'en' ? 'Login to your journey' : 'आपल्या प्रवासात प्रवेश करा'}
        </h1>
        <p className="mt-1 text-xs text-gray-500">
          {language === 'en'
            ? 'Access your fort bookings, guides and saved routes.'
            : 'आपली किल्ले बुकिंग, मार्गदर्शक आणि जतन केलेले मार्ग पहा.'}
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-xs">
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
              {language === 'en' ? 'Password' : 'पासवर्ड'}
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
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
                ? 'Signing in...'
                : 'लॉगिन चालू...'
              : language === 'en'
              ? 'Login'
              : 'लॉगिन'}
          </button>
        </form>

        <p className="mt-3 text-[11px] text-gray-500">
          {language === 'en' ? 'New here?' : 'नवीन आहात?'}{' '}
          <Link to="/register" className="text-primary hover:text-primaryDark">
            {language === 'en' ? 'Create an account' : 'खाते तयार करा'}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

