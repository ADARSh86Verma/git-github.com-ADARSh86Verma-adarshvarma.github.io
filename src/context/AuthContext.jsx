import { createContext, useContext, useState, useCallback } from 'react';
import { login as apiLogin } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('erp_user')); } catch { return null; }
  });

  const signIn = useCallback(async (email, password) => {
    const res = await apiLogin({ email, password });
    const { token, user: userData } = res.data;
    localStorage.setItem('erp_token', token);
    localStorage.setItem('erp_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem('erp_token');
    localStorage.removeItem('erp_user');
    setUser(null);
  }, []);

  const updateUser = useCallback((updates) => {
    const updated = { ...user, ...updates };
    localStorage.setItem('erp_user', JSON.stringify(updated));
    setUser(updated);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
