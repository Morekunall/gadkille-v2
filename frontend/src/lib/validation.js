export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export const validatePassword = (password, language = 'en') => {
  if (!password) {
    return language === 'en' ? 'Password is required' : 'पासवर्ड आवश्यक आहे';
  }
  if (!PASSWORD_REGEX.test(password)) {
    return language === 'en'
      ? 'Use 8+ characters with uppercase, lowercase, and a number'
      : '८+ अक्षरे, मोठे/लहान अक्षर आणि एक अंक वापरा';
  }
  return null;
};

export const validateEmail = (email, language = 'en') => {
  if (!email?.trim()) {
    return language === 'en' ? 'Email is required' : 'ई-मेल आवश्यक आहे';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return language === 'en' ? 'Enter a valid email address' : 'वैध ई-मेल प्रविष्ट करा';
  }
  return null;
};
