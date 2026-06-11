import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as authApi from '../api/auth';
import { TOKEN_KEY } from '../lib/axiosAuth';
import { getApiErrorMessage } from '../lib/getApiErrorMessage';

const AuthContext = createContext(null);

const persistSession = (token, setToken) => {
  setToken(token);
  localStorage.setItem(TOKEN_KEY, token);
};

const clearSession = (setToken, setUser) => {
  setUser(null);
  setToken(null);
  localStorage.removeItem(TOKEN_KEY);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(false);

  const fetchMeWithRetry = async (maxAttempts = 6) => {
    let lastError;
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      try {
        return await authApi.getMe();
      } catch (err) {
        lastError = err;
        const status = err.response?.status;
        const retryable = !status || status === 503 || status >= 500;
        if (!retryable || attempt === maxAttempts - 1) break;
        await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
      }
    }
    throw lastError;
  };

  const authenticateWithToken = useCallback(
    async (tokenValue) => {
      if (!tokenValue) return null;
      const cleanToken = String(tokenValue).trim();
      persistSession(cleanToken, setToken);
      try {
        const data = await fetchMeWithRetry();
        setUser(data.user);
        return data.user;
      } catch (err) {
        clearSession(setToken, setUser);
        if (import.meta.env.DEV) {
          console.error('[auth] Google session failed:', err.response?.data || err.message);
        }
        return null;
      }
    },
    [setToken, setUser]
  );

  useEffect(() => {
    if (token) {
      (async () => {
        try {
          const data = await authApi.getMe();
          setUser(data.user);
        } catch {
          clearSession(setToken, setUser);
        }
      })();
    } else {
      setUser(null);
    }
  }, [token]);

  useEffect(() => {
    const onUnauthorized = () => clearSession(setToken, setUser);
    window.addEventListener('gadkille:unauthorized', onUnauthorized);
    return () => window.removeEventListener('gadkille:unauthorized', onUnauthorized);
  }, [setToken, setUser]);

  const applyAuthResponse = (data) => {
    if (data.token && data.user) {
      setUser(data.user);
      persistSession(data.token, setToken);
    }
  };

  const checkEmail = async (email) => {
    try {
      const data = await authApi.checkEmail(email);
      return { success: true, ...data };
    } catch (err) {
      if (err.response?.status === 404) {
        return {
          success: true,
          exists: null,
          verified: null,
          legacyMode: true,
        };
      }
      return {
        success: false,
        message: getApiErrorMessage(err, 'Could not check email'),
      };
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await authApi.login(email, password);
      applyAuthResponse(data);
      return { success: true, user: data.user };
    } catch (err) {
      const data = err.response?.data;
      const message = getApiErrorMessage(err, 'Login failed');
      let hint = '';
      if (data?.message === 'Invalid credentials') {
        const onRender =
          String(import.meta.env.VITE_API_URL || '').includes('onrender') ||
          (!import.meta.env.VITE_API_URL && !import.meta.env.DEV);
        if (onRender) {
          hint =
            ' Try live admin: admin@gadkille.local / Admin@12345 — or set ADMIN_EMAIL and ADMIN_PASSWORD on Render and redeploy.';
        }
      }
      return {
        success: false,
        message: message + hint,
        code: data?.code,
        email: data?.email,
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    setLoading(true);
    try {
      const data = await authApi.register(payload);
      return {
        success: true,
        message: data.message,
        email: data.email,
        requiresVerification: true,
        devOtp: data.devOtp,
        devVerifyLink: data.devVerifyLink,
      };
    } catch (err) {
      return { success: false, message: getApiErrorMessage(err, 'Registration failed') };
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async (email, otp) => {
    setLoading(true);
    try {
      const data = await authApi.verifyEmail(email, otp);
      applyAuthResponse(data);
      return { success: true, message: data.message, user: data.user };
    } catch (err) {
      return { success: false, message: getApiErrorMessage(err, 'Verification failed') };
    } finally {
      setLoading(false);
    }
  };

  const verifyEmailByToken = async (verifyToken) => {
    setLoading(true);
    try {
      const data = await authApi.verifyEmailByToken(verifyToken);
      if (data.alreadyVerified) {
        return { success: true, alreadyVerified: true, message: data.message };
      }
      applyAuthResponse(data);
      return { success: true, message: data.message, user: data.user };
    } catch (err) {
      return { success: false, message: getApiErrorMessage(err, 'Verification failed') };
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async (email) => {
    setLoading(true);
    try {
      const data = await authApi.resendVerification(email);
      return { success: true, message: data.message };
    } catch (err) {
      return { success: false, message: getApiErrorMessage(err, 'Could not resend code') };
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    setLoading(true);
    try {
      const data = await authApi.forgotPassword(email);
      return {
        success: true,
        message: data.message,
        emailSent: data.emailSent,
        devResetLink: data.devResetLink,
      };
    } catch (err) {
      return { success: false, message: getApiErrorMessage(err, 'Request failed') };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (tokenValue, password) => {
    setLoading(true);
    try {
      const data = await authApi.resetPassword(tokenValue, password);
      return { success: true, message: data.message };
    } catch (err) {
      return { success: false, message: getApiErrorMessage(err, 'Reset failed') };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => clearSession(setToken, setUser);

  const updateProfile = async (payload) => {
    setLoading(true);
    try {
      const data = await authApi.updateProfile(payload);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      return { success: false, message: getApiErrorMessage(err, 'Update failed') };
    } finally {
      setLoading(false);
    }
  };

  const completeProfile = async (phone) => {
    setLoading(true);
    try {
      const data = await authApi.completeProfile(phone);
      applyAuthResponse(data);
      return {
        success: true,
        user: data.user,
        message: data.message,
        accountEmailSent: data.accountEmailSent,
        accountEmailError: data.accountEmailError,
      };
    } catch (err) {
      return { success: false, message: getApiErrorMessage(err, 'Could not save phone number') };
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        authenticateWithToken,
        checkEmail,
        login,
        register,
        verifyEmail,
        verifyEmailByToken,
        resendVerification,
        forgotPassword,
        resetPassword,
        logout,
        updateProfile,
        completeProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
