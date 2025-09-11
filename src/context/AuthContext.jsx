import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('teacherId');
    const userName = localStorage.getItem('userName');
    const userEmail = localStorage.getItem('userEmail');
    const userRole = localStorage.getItem('userRole');

    if (token && userId) {
      setUser({
        id: userId,
        name: userName,
        email: userEmail,
        role: userRole
      });
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('teacherId', userData.id);
    localStorage.setItem('userName', userData.fullName || userData.name);
    localStorage.setItem('userEmail', userData.email);
    localStorage.setItem('userRole', userData.role);
    setUser({
      id: userData.id,
      name: userData.fullName || userData.name,
      email: userData.email,
      role: userData.role
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('teacherId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};