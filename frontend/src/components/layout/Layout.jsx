import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import SeoHead from '../seo/SeoHead';
import { useUi } from '../../context/UiContext';

const NOINDEX_PATHS = [
  '/login',
  '/register',
  '/verify-email',
  '/forgot-password',
  '/reset-password',
  '/complete-profile',
  '/dashboard'
];

const Layout = () => {
  const { toast } = useUi();
  const { pathname } = useLocation();
  const isPrivatePage = NOINDEX_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  return (
    <div className="flex min-h-screen flex-col bg-softBg">
      {isPrivatePage && <SeoHead title="GadKille" noindex />}
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      {toast && (
        <div className="fixed bottom-4 left-4 right-4 z-30 sm:left-auto sm:right-4 sm:max-w-sm">
          <div
            className={`rounded-xl px-4 py-2 text-xs shadow-soft ${
              toast.type === 'error'
                ? 'bg-red-50 text-red-700'
                : 'bg-emerald-50 text-emerald-700'
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
