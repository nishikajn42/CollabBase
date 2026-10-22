import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Error reading user data", error);
      }
    }
    setIsLoading(false);
  }, []);

  const value = useMemo(() => ({
    currentUser,
    isLoading,
    isAuthenticated: Boolean(currentUser),
    
    signIn: (userData) => { 
      localStorage.setItem('user', JSON.stringify(userData));
      if (userData.token) localStorage.setItem('token', userData.token);
      setCurrentUser(userData); 
      return userData; 
    },
    
    // NEW: Function to instantly update profile photo & data across the app
    updateUser: (updates) => {
      setCurrentUser(prev => {
        const updatedUser = { ...prev, ...updates };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return updatedUser;
      });
    },
    
    signOut: () => { 
      localStorage.removeItem('user');
      localStorage.removeItem('token'); 
      setCurrentUser(null); 
    }
  }), [currentUser, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}