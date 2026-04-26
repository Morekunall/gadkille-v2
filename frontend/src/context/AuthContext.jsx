import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('gadkille_token'));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
      // Hydrate user so UI matches token-based auth
      (async () => {
        try {
          const res = await axios.get(`${import.meta.env.VITE_API_URL}/auth/me`);
          setUser(res.data.user);
        } catch {
          // Token invalid/expired => clear session
          setUser(null);
          setToken(null);
          localStorage.removeItem('gadkille_token');
          delete axios.defaults.headers.common.Authorization;
        }
      })();
    } else {
      setUser(null);
      delete axios.defaults.headers.common.Authorization;
    }
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, {
        email,
        password,
      });
      setUser(res.data.user);
      setToken(res.data.token);
      localStorage.setItem('gadkille_token', res.data.token);
      axios.defaults.headers.common.Authorization = `Bearer ${res.data.token}`;
      return { success: true, user: res.data.user };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (err.request ? 'Unable to reach server. Is the backend running?' : err.message) ||
        'Login failed';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, payload);
      setUser(res.data.user);
      setToken(res.data.token);
      localStorage.setItem('gadkille_token', res.data.token);
      axios.defaults.headers.common.Authorization = `Bearer ${res.data.token}`;
      return { success: true };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (err.request ? 'Unable to reach server. Is the backend running?' : err.message) ||
        'Registration failed';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('gadkille_token');
    delete axios.defaults.headers.common.Authorization;
  };

  const updateProfile = async (payload) => {
    setLoading(true);
    try {
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/auth/me`, payload);
      setUser(res.data.user);
      return { success: true };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (err.request ? 'Unable to reach server. Is the backend running?' : err.message) ||
        'Update failed';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

