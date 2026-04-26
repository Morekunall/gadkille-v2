import { createContext, useContext, useState } from 'react';

const UiContext = createContext(null);

// Simple English/Marathi toggle and global UI helpers
export const UiProvider = ({ children }) => {
  const [language, setLanguage] = useState(localStorage.getItem('gadkille_lang') || 'en'); // 'en' | 'mr'
  const [toast, setToast] = useState(null);

  const toggleLanguage = () => {
    setLanguage((prev) => {
      const next = prev === 'en' ? 'mr' : 'en';
      localStorage.setItem('gadkille_lang', next);
      return next;
    });
  };

  const changeLanguage = (nextLanguage) => {
    if (!['en', 'mr'].includes(nextLanguage)) return;
    setLanguage(nextLanguage);
    localStorage.setItem('gadkille_lang', nextLanguage);
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <UiContext.Provider value={{ language, toggleLanguage, changeLanguage, toast, showToast }}>
      {children}
    </UiContext.Provider>
  );
};

export const useUi = () => useContext(UiContext);

