import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useUi } from '../../context/UiContext';

const ADMIN_TABS = [
  { id: 'overview', labelEn: 'Overview', labelMr: 'माहिती' },
  { id: 'requests', labelEn: 'Bookings', labelMr: 'बुकिंग' },
  { id: 'inquiries', labelEn: 'Inquiries', labelMr: 'चौकशी' },
  { id: 'forts', labelEn: 'Forts', labelMr: 'किल्ले' },
  { id: 'history', labelEn: 'History', labelMr: 'इतिहास' },
  { id: 'treks', labelEn: 'Upcoming Treks', labelMr: 'आगामी ट्रेक' },
  { id: 'vendors', labelEn: 'Vendors', labelMr: 'वेंडर' },
];

const AdminNavbar = () => {
  const { user, logout } = useAuth();
  const { language, changeLanguage } = useUi();
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const activeTab = searchParams.get('tab') || 'overview';
  const t = (en, mr) => (language === 'en' ? en : mr);
  const avatarText = (user?.name || user?.email || 'A').slice(0, 1).toUpperCase();

  const goToTab = (tabId) => {
    setSearchParams({ tab: tabId }, { replace: true });
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-primaryDark text-white shadow-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
        <Link
          to="/admin?tab=overview"
          className="flex shrink-0 items-center gap-2.5"
          onClick={() => goToTab('overview')}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
            <svg
              className="h-5 w-5 text-accent"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
              />
            </svg>
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold tracking-wide">GadKille</p>
            <p className="text-[10px] font-medium uppercase tracking-widest text-accent">
              {t('Admin Console', 'अॅडमिन कन्सोल')}
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {ADMIN_TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => goToTab(item.id)}
              className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                activeTab === item.id
                  ? 'bg-white text-primaryDark shadow-sm'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              {language === 'en' ? item.labelEn : item.labelMr}
            </button>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            to="/"
            className="rounded-lg border border-white/20 px-3 py-1.5 text-xs font-medium text-white/90 transition hover:bg-white/10"
          >
            {t('View site', 'साइट पहा')}
          </Link>
          <select
            value={language}
            onChange={(e) => changeLanguage(e.target.value)}
            className="rounded-lg border border-white/20 bg-white/10 px-2 py-1.5 text-xs font-medium text-white focus:border-accent focus:outline-none"
          >
            <option value="en" className="text-gray-900">
              EN
            </option>
            <option value="mr" className="text-gray-900">
              मर
            </option>
          </select>
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((p) => !p)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-bold text-primaryDark ring-2 ring-white/30"
            >
              {avatarText}
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-52 rounded-xl border border-gray-100 bg-white py-2 text-gray-800 shadow-xl">
                <p className="border-b border-gray-100 px-3 pb-2 text-[11px] text-gray-500">{user?.email}</p>
                <p className="px-3 py-1 text-xs font-semibold text-primaryDark">
                  {t('Administrator', 'प्रशासक')}
                </p>
                <Link
                  to="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 text-xs hover:bg-softBg"
                >
                  {t('User dashboard', 'वापरकर्ता डॅशबोर्ड')}
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                  }}
                  className="block w-full px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50"
                >
                  {t('Sign out', 'साइन आउट')}
                </button>
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((p) => !p)}
          className="rounded-lg border border-white/25 px-3 py-1.5 text-xs font-semibold lg:hidden"
        >
          {t('Menu', 'मेनू')}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/10 bg-primaryDark/95 px-4 py-3 lg:hidden">
          <div className="grid grid-cols-2 gap-2">
            {ADMIN_TABS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => goToTab(item.id)}
                className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                  activeTab === item.id ? 'bg-white text-primaryDark' : 'bg-white/10 text-white'
                }`}
              >
                {language === 'en' ? item.labelEn : item.labelMr}
              </button>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-white/10 pt-3">
            <Link to="/" onClick={() => setMobileOpen(false)} className="text-xs text-white/90">
              {t('View site', 'साइट पहा')}
            </Link>
            <select
              value={language}
              onChange={(e) => changeLanguage(e.target.value)}
              className="rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-xs text-white"
            >
              <option value="en">EN</option>
              <option value="mr">मर</option>
            </select>
            <button type="button" onClick={logout} className="text-xs text-red-300">
              {t('Sign out', 'साइन आउट')}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default AdminNavbar;
