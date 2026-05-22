import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useUi } from '../../context/UiContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { language, changeLanguage } = useUi();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navItems = [
    { to: '/', label: language === 'en' ? 'Home' : 'मुख्यपृष्ठ' },
    { to: '/explore', label: language === 'en' ? 'Explore' : 'भ्रमंती' },
    { to: '/plan-trip', label: language === 'en' ? 'Plan Trip' : 'ट्रिप प्लॅन' },
    { to: '/contact', label: language === 'en' ? 'Contact' : 'संपर्क' }
  ];
  const avatarText = (user?.name || user?.email || 'U').slice(0, 1).toUpperCase();

  return (
    <header className="sticky top-0 z-20 border-b border-primary/10 bg-white/85 backdrop-blur-md shadow-soft">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white font-bold">
            G
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-primaryDark">GadKille</p>
            <p className="text-xs text-gray-500">{language === 'en' ? 'Fort Exploration' : 'किल्ले भ्रमंती'}</p>
          </div>
        </Link>

        <div className="hidden items-center gap-4 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className="text-sm font-medium text-gray-700 transition hover:text-primaryDark"
            >
              {item.label}
            </NavLink>
          ))}
          <select
            value={language}
            onChange={(e) => changeLanguage(e.target.value)}
            className="rounded-full border border-gray-200 bg-softBg px-3 py-1 text-xs font-semibold text-primaryDark focus:border-primary focus:outline-none"
          >
            <option value="en">English</option>
            <option value="mr">मराठी</option>
          </select>

          {!user ? (
            <div className="flex items-center gap-2">
              <NavLink
                to="/login"
                className="text-xs font-medium text-gray-700 hover:text-primaryDark"
              >
                {language === 'en' ? 'Login' : 'लॉगिन'}
              </NavLink>
              <NavLink
                to="/plan-trip"
                className="rounded-full bg-gradient-to-r from-primary to-primaryDark px-4 py-1.5 text-xs font-semibold text-white shadow-soft transition hover:brightness-110"
              >
                {language === 'en' ? 'Plan Trip' : 'ट्रिप प्लॅन'}
              </NavLink>
            </div>
          ) : (
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen((prev) => !prev)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primaryDark text-sm font-semibold text-white ring-2 ring-primary/20"
              >
                {avatarText}
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-gray-100 bg-white p-2 shadow-soft">
                  <p className="px-2 py-1 text-[11px] text-gray-500">{user.email}</p>
                  <NavLink
                    to={user.role === 'admin' ? '/admin' : '/dashboard'}
                    onClick={() => setProfileOpen(false)}
                    className="block rounded-lg px-2 py-2 text-xs text-gray-700 hover:bg-softBg"
                  >
                    {user.role === 'admin'
                      ? language === 'en'
                        ? 'Admin Panel'
                        : 'अॅडमिन पॅनेल'
                      : language === 'en'
                      ? 'Dashboard'
                      : 'डॅशबोर्ड'}
                  </NavLink>
                  <NavLink
                    to="/dashboard"
                    onClick={() => setProfileOpen(false)}
                    className="block rounded-lg px-2 py-2 text-xs text-gray-700 hover:bg-softBg"
                  >
                    {language === 'en' ? 'Edit Profile' : 'प्रोफाइल संपादित करा'}
                  </NavLink>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      logout();
                    }}
                    className="block w-full rounded-lg px-2 py-2 text-left text-xs text-red-600 hover:bg-red-50"
                  >
                    {language === 'en' ? 'Logout' : 'लॉगआउट'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        <button type="button" onClick={() => setMobileOpen((prev) => !prev)} className="rounded-lg border border-primary/20 bg-white/70 px-3 py-1 text-xs font-semibold text-primaryDark md:hidden">
          Menu
        </button>
      </nav>
      {mobileOpen && (
        <div className="border-t border-gray-100 bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-2">
            <select
              value={language}
              onChange={(e) => changeLanguage(e.target.value)}
              className="mb-1 rounded-xl border border-gray-200 bg-softBg px-3 py-2 text-xs font-semibold text-primaryDark focus:border-primary focus:outline-none"
            >
              <option value="en">English</option>
              <option value="mr">मराठी</option>
            </select>
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} onClick={() => setMobileOpen(false)} className="text-sm font-medium text-gray-700">
                {item.label}
              </NavLink>
            ))}
            {!user ? (
              <div className="mt-2 flex items-center gap-2">
                <NavLink to="/login" onClick={() => setMobileOpen(false)} className="text-xs font-medium text-gray-700">{language === 'en' ? 'Login' : 'लॉगिन'}</NavLink>
                <NavLink to="/plan-trip" onClick={() => setMobileOpen(false)} className="rounded-full bg-gradient-to-r from-primary to-primaryDark px-4 py-1.5 text-xs font-semibold text-white">{language === 'en' ? 'Plan Trip' : 'ट्रिप प्लॅन'}</NavLink>
              </div>
            ) : (
              <div className="mt-2 flex flex-col gap-2">
                <NavLink to={user.role === 'admin' ? '/admin' : '/dashboard'} onClick={() => setMobileOpen(false)} className="text-xs font-medium text-gray-700">
                  {user.role === 'admin'
                    ? language === 'en'
                      ? 'Admin Panel'
                      : 'अॅडमिन पॅनेल'
                    : language === 'en'
                    ? 'Dashboard'
                    : 'डॅशबोर्ड'}
                </NavLink>
                <NavLink to="/dashboard" onClick={() => setMobileOpen(false)} className="text-xs font-medium text-gray-700">
                  {language === 'en' ? 'Edit Profile' : 'प्रोफाइल संपादित करा'}
                </NavLink>
                <button type="button" onClick={logout} className="text-xs font-medium text-gray-700">{language === 'en' ? 'Logout' : 'लॉगआउट'}</button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

