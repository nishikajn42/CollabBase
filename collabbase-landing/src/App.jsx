import { useEffect, useState } from 'react';
import { useAuth } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import LandingPage from './components/LandingPage';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import DashboardLayout from './layouts/DashboardLayout';

function App() {
  const { isAuthenticated, isLoading, currentUser: authUser } = useAuth();
  const [currentPage, setCurrentPage] = useState('landing');
  const [activeTab, setActiveTab] = useState('home');
  const [currentUser, setCurrentUser] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(() => window.localStorage.getItem('theme') === 'dark');

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
    setCurrentPage(page);
  };

  const handleOnboardingComplete = (updatedUser) => {
    setCurrentUser(updatedUser);
    setCurrentPage('dashboard');
  };

  if (isLoading) return <div className="loading-screen">Loading CollabBase...</div>;
  if (currentPage === 'landing'){
    return (
      <LandingPage
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode((v) => !v)}
        onSignIn={() => setCurrentPage('login')}
      />
    );
  }
  if (currentPage === 'login'){
    return (
      <Login
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode((v) => !v)}
        onSignedIn={handleSignedIn}
      />
    );
  }
  if (currentPage === 'onboarding') {
    return (
      <Onboarding
        user={currentUser}
        isDarkMode={isDarkMode}
        onComplete={handleOnboardingComplete}
      />
    );
  }
  return (
    <DashboardLayout
      user={authUser || currentUser}
      isDarkMode={isDarkMode}
      onToggleTheme={() => setIsDarkMode((v) => !v)}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onBackToLanding={() => setCurrentPage('landing')}
    >
      <Dashboard activeTab={activeTab} setActiveTab={setActiveTab} user={authUser || currentUser} />
    </DashboardLayout>
  );
}

export default App;
