import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial load from localStorage
    const savedUser = authService.getCurrentUser();
    if (savedUser && authService.isAuthenticated()) {
      setUser(savedUser);
      // Verify/refresh profile
      authService.getProfile()
        .then((profile) => {
          const updated = {
            ...savedUser,
            userId: profile.userId,
            fullName: profile.fullName,
            email: profile.email,
            phone: profile.phone,
            roles: profile.roles,
            role: profile.roles && profile.roles.includes('ADMIN') ? 'ADMIN' : 'CUSTOMER',
            accountStatus: profile.accountStatus
          };
          setUser(updated);
          localStorage.setItem('fincore_user', JSON.stringify(updated));
        })
        .catch(() => {
          // If profile fetch fails due to 401, token is invalid
          if (!authService.isAuthenticated()) {
            setUser(null);
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    setUser(data);
    return data;
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    setUser(data);
    return data;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateUserState = (updatedFields) => {
    setUser(prev => {
      const next = { ...prev, ...updatedFields };
      localStorage.setItem('fincore_user', JSON.stringify(next));
      return next;
    });
  };

  const isAdmin = user?.role === 'ADMIN' || (user?.roles && user.roles.includes('ADMIN'));

  const value = {
    user,
    loading,
    isAuthenticated: !!user && authService.isAuthenticated(),
    isAdmin,
    login,
    register,
    logout,
    updateUserState
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
