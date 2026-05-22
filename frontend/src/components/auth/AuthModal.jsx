import { Link } from 'react-router-dom';
import { getGoogleAuthUrl } from '../../lib/api';

const AuthModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-slate-950/95 p-6 text-white shadow-2xl shadow-black/30 backdrop-blur-xl">
        <button
          type="button"
          className="absolute right-4 top-4 rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-white hover:bg-white/20"
          onClick={onClose}
        >
          Close
        </button>
        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-semibold">Welcome Back</h2>
            <p className="text-sm text-slate-400">Sign in or register to continue exploring GadKille</p>
          </div>
          <a
            href={getGoogleAuthUrl()}
            className="flex items-center justify-center gap-3 rounded-full bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-soft transition hover:bg-slate-100"
          >
            <img
              src="https://www.svgrepo.com/show/355037/google.svg"
              alt="Google"
              className="h-5 w-5"
            />
            Continue with Google
          </a>
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-slate-500">
            <span className="h-px flex-1 bg-slate-700" />
            <span>or</span>
            <span className="h-px flex-1 bg-slate-700" />
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 text-sm text-slate-300">
            <p className="mb-4">Use email and password</p>
            <div className="space-y-4">
              <input
                type="email"
                placeholder="Enter your email address"
                className="w-full rounded-3xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <input
                type="password"
                placeholder="Enter password"
                className="w-full rounded-3xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="button"
                className="w-full rounded-3xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
              >
                Create account
              </button>
            </div>
          </div>
          <div className="text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-white hover:text-primary" onClick={onClose}>
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
