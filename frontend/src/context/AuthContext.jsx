import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import axios from '../lib/axiosAuth';

const AuthContext = createContext(null);

const persistSession = (token, setToken, setUser) => {
  setToken(token);
  localStorage.setItem('gadkille_token', token);
  axios.defaults.headers.common.Authorization = `Bearer ${token}`;
};

const clearSession = (setToken, setUser) => {
  setUser(null);
  setToken(null);
  localStorage.removeItem('gadkille_token');
  delete axios.defaults.headers.common.Authorization;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('gadkille_token'));
  const [loading, setLoading] = useState(false);

  const fetchMeWithRetry = async (maxAttempts = 6) => {
    let lastError;
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      try {
        return await axios.get('/auth/me');
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
      persistSession(cleanToken, setToken, setUser);
      try {
        const res = await fetchMeWithRetry();
        setUser(res.data.user);
        return res.data.user;
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
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
      (async () => {
        try {
          const res = await axios.get('/auth/me');
          setUser(res.data.user);
        } catch {
          clearSession(setToken, setUser);
        }
      })();
    } else {
      setUser(null);
      delete axios.defaults.headers.common.Authorization;
    }
  }, [token]);

  const applyAuthResponse = (data) => {
    if (data.token && data.user) {
      setUser(data.user);
      persistSession(data.token, setToken, setUser);
    }
  };

  const checkEmail = async (email) => {
    try {
      const res = await axios.post('/auth/check-email', { email: email.trim() });
      return { success: true, ...res.data };
    } catch (err) {
      if (err.response?.status === 404) {
        return {
          success: true,
          exists: null,
          verified: null,
          legacyMode: true,
        };
      }
      const message =
        err.response?.data?.message ||
        (err.request && !err.response
          ? 'Cannot reach server. Start the backend (npm run dev) or check your connection.'
          : null) ||
        'Could not check email';
      return { success: false, message };
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await axios.post('/auth/login', { email, password });
      applyAuthResponse(res.data);
      return { success: true, user: res.data.user };
    } catch (err) {
      const data = err.response?.data;
      const message =
        data?.message ||
        (typeof data === 'string' ? data : null) ||
        (err.request && !err.response
          ? 'Cannot reach server. On mobile, use the live site or same Wi‑Fi as your PC — not localhost.'
          : null) ||
        err.message ||
        'Login failed';
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
        message: (message || 'Login failed') + hint,
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
      const res = await axios.post('/auth/register', payload);
      return {
        success: true,
        message: res.data.message,
        email: res.data.email,
        requiresVerification: true,
        devOtp: res.data.devOtp,
        devVerifyLink: res.data.devVerifyLink,
      };
    } catch (err) {
      const data = err.response?.data;
      const message =
        data?.message ||
        (typeof data === 'string' ? data : null) ||
        (err.request ? 'Cannot reach server. Check your connection and try again.' : null) ||
        err.message ||
        'Registration failed';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async (email, otp) => {
    setLoading(true);
    try {
      const res = await axios.post('/auth/verify-email', { email, otp });
      applyAuthResponse(res.data);
      return { success: true, message: res.data.message, user: res.data.user };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Verification failed',
      };
    } finally {
      setLoading(false);
    }
  };

  const verifyEmailByToken = async (verifyToken) => {
    setLoading(true);
    try {
      const res = await axios.get('/auth/verify-email', {
        params: { token: verifyToken },
      });
      if (res.data.alreadyVerified) {
        return { success: true, alreadyVerified: true, message: res.data.message };
      }
      applyAuthResponse(res.data);
      return { success: true, message: res.data.message, user: res.data.user };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Verification failed',
      };
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async (email) => {
    setLoading(true);
    try {
      const res = await axios.post('/auth/resend-verification', { email });
      return { success: true, message: res.data.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Could not resend code',
      };
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    setLoading(true);
    try {
      const res = await axios.post('/auth/forgot-password', { email });
      return {
        success: true,
        message: res.data.message,
        emailSent: res.data.emailSent,
        devResetLink: res.data.devResetLink,
      };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Request failed',
      };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token, password) => {
    setLoading(true);
    try {
      const res = await axios.post('/auth/reset-password', { token, password });
      return { success: true, message: res.data.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Reset failed',
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => clearSession(setToken, setUser);

  const updateProfile = async (payload) => {
    setLoading(true);
    try {
      const res = await axios.put('/auth/me', payload);
      setUser(res.data.user);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Update failed',
      };
    } finally {
      setLoading(false);
    }
  };

  const completeProfile = async (phone) => {
    setLoading(true);
    try {
      const res = await axios.post('/auth/complete-profile', { phone });
      applyAuthResponse(res.data);
      return { success: true, user: res.data.user, message: res.data.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Could not save phone number',
      };
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
