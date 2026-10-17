import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { demoAuthService } from '../services/demoAuthService';

const AuthContext = createContext(null);

export function AuthProvider({ children, service = demoAuthService }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    service.getCurrentUser().then(setCurrentUser).finally(() => setIsLoading(false));
  }, [service]);

  const value = useMemo(() => ({
    currentUser,
    isLoading,
    isAuthenticated: Boolean(currentUser),
    signIn: async (credentials) => { const user = await service.signIn(credentials); setCurrentUser(user); return user; },
    signOut: async () => { await service.signOut(); setCurrentUser(null); },
    switchProfile: async (userId) => { const user = await service.switchProfile(userId); setCurrentUser(user); return user; },
  }), [currentUser, isLoading, service]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}