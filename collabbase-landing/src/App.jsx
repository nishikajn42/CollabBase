import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import LandingPage from './components/LandingPage';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import DashboardLayout from './layouts/DashboardLayout';

function AppRoutes() {
  const { isAuthenticated, isLoading, currentUser: authUser, signIn } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [isDarkMode, setIsDarkMode] = useState(() => window.localStorage.getItem('theme') === 'dark');
  
  const navigate = useNavigate();
  const location = useLocation();
  const activeUser = authUser;

  // URL ke hisaab se tab update karo (taaki search ki gayi profile properly open ho)
  useEffect(() => {
    if (location.pathname.includes('/profile')) {
      setActiveTab('profile');
    } else if (location.pathname.includes('/messages')) {
      setActiveTab('messages');
    } else if (location.pathname.includes('/dashboard')) {
      setActiveTab('home');
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
    signIn(userData); 
    navigate('/' + page);
  };

  const handleOnboardingComplete = (updatedUser) => {
    signIn(updatedUser); 
    navigate('/dashboard');
  };

  // Custom tab switcher jo click karne par URL bhi change karega
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'home') navigate('/dashboard');
    else if (tab === 'profile') navigate('/profile');
    else if (tab === 'messages') navigate('/messages');
  };

  if (isLoading) return <div className="flex h-screen items-center justify-center text-slate-500">Loading CollabBase...</div>;

  return (
    <Routes>
      <Route path="/" element={ activeUser ? <Navigate to="/dashboard" /> : <LandingPage isDarkMode={isDarkMode} onToggleTheme={() => setIsDarkMode((v) => !v)} onSignIn={() => navigate('/login')} /> } />
      
      <Route path="/login" element={ <Login isDarkMode={isDarkMode} onToggleTheme={() => setIsDarkMode((v) => !v)} onSignedIn={handleSignedIn} /> } />
      
      <Route path="/onboarding" element={ <Onboarding user={activeUser} isDarkMode={isDarkMode} onComplete={handleOnboardingComplete} /> } />

      {/* Wildcard Route: Ye akela route Dashboard, Messages aur Profile sabko handle karega */}
      <Route path="/*" element={
        activeUser ? (
          <DashboardLayout 
            user={activeUser} 
            isDarkMode={isDarkMode} 
            onToggleTheme={() => setIsDarkMode((v) => !v)} 
            activeTab={activeTab} 
            setActiveTab={handleTabChange}
          >
            <Dashboard activeTab={activeTab} user={activeUser} />
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