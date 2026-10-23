import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Instant load from local storage
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (savedUser) {
      try { setCurrentUser(JSON.parse(savedUser)); } catch (error) { console.error(error); }
    }

    // 2. BACKGROUND SYNC: Always fetch latest DB data to prevent Phone/Laptop mismatch
    if (token) {
      fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(latestUser => {
        if (!latestUser.error) {
          setCurrentUser(latestUser);
          localStorage.setItem('user', JSON.stringify(latestUser));
        }
      })
      .catch(err => console.error("Sync error:", err))
      .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
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