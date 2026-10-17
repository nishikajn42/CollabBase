import { useEffect, useState } from 'react';
import { useAuth } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import LandingPage from './components/LandingPage';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';

function App() {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState('landing');
  const [activeTab, setActiveTab] = useState('home');
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

  if (isLoading) return <div className="loading-screen">Loading CollabBase...</div>;
  if (currentPage === 'landing') return <LandingPage isDarkMode={isDarkMode} onToggleTheme={() => setIsDarkMode((value) => !value)} onSignIn={() => setCurrentPage('login')} />;
  if (currentPage === 'login') return <Login onSignedIn={() => setCurrentPage('dashboard')} />;
  if (!isAuthenticated) return <Login onSignedIn={() => setCurrentPage('dashboard')} />;
  return <DashboardLayout isDarkMode={isDarkMode} onToggleTheme={() => setIsDarkMode((value) => !value)} activeTab={activeTab} setActiveTab={setActiveTab} onBackToLanding={() => setCurrentPage('landing')}><Dashboard activeTab={activeTab} setActiveTab={setActiveTab} /></DashboardLayout>;
}

export default App;
