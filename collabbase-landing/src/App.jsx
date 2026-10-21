import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import LandingPage from './components/LandingPage';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import DashboardLayout from './layouts/DashboardLayout';

// Wrapper component to handle routing logic smoothly
function AppRoutes() {
  const { isAuthenticated, isLoading, currentUser: authUser } = useAuth();
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [isDarkMode, setIsDarkMode] = useState(() => window.localStorage.getItem('theme') === 'dark');
  
  const navigate = useNavigate();
  const location = useLocation();
  const activeUser = authUser || currentUser;

  // Automatically switch tab to profile if the URL contains /profile/
  useEffect(() => {
    if (location.pathname.includes('/profile/')) {
      setActiveTab('profile');
    }
  }, [location.pathname]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const handleSignedIn = (page, userData) => {
    setCurrentUser(userData);
    navigate('/' + page);
  };

  const handleOnboardingComplete = (updatedUser) => {
    setCurrentUser(updatedUser);
    navigate('/dashboard');
  };

  if (isLoading) return <div className="flex h-screen items-center justify-center text-slate-500">Loading CollabBase...</div>;

  return (
    <Routes>
      <Route path="/" element={
        activeUser ? <Navigate to="/dashboard" /> : (
          <LandingPage
            isDarkMode={isDarkMode}
            onToggleTheme={() => setIsDarkMode((v) => !v)}
            onSignIn={() => navigate('/login')}
          />
        )
      } />
      
      <Route path="/login" element={
        <Login
          isDarkMode={isDarkMode}
          onToggleTheme={() => setIsDarkMode((v) => !v)}
          onSignedIn={handleSignedIn}
        />
      } />

      <Route path="/onboarding" element={
        <Onboarding
          user={activeUser}
          isDarkMode={isDarkMode}
          onComplete={handleOnboardingComplete}
        />
      } />

      {/* This wildcard route safely catches /dashboard, /profile/:handle, etc. */}
      <Route path="/*" element={
        activeUser ? (
          <DashboardLayout
            user={activeUser}
            isDarkMode={isDarkMode}
            onToggleTheme={() => setIsDarkMode((v) => !v)}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onBackToLanding={() => {
              setCurrentUser(null);
              navigate('/');
            }}
          >
            <Dashboard activeTab={activeTab} setActiveTab={setActiveTab} user={activeUser} />
          </DashboardLayout>
        ) : <Navigate to="/" />
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}