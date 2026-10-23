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
  const { isAuthenticated, isLoading, currentUser: authUser, signIn } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(() => window.localStorage.getItem('theme') === 'dark');
  
  const navigate = useNavigate();
  const location = useLocation();
  const activeUser = authUser;

  // URL se active tab pata lagana taaki DashboardLayout ka sidemenu sahi highlight ho
  let activeTab = 'home';
  if (location.pathname.startsWith('/profile')) activeTab = 'profile';
  if (location.pathname.startsWith('/messages')) activeTab = 'messages';

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
    signIn(userData); // Ye context aur LocalStorage dono me data save karega
    navigate('/' + page);
  };

  const handleOnboardingComplete = (updatedUser) => {
    signIn(updatedUser); // Ye ensure karega ki refresh karne par data na ude
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

      {/* --- EXPLICIT PROTECTED ROUTES --- */}
      
      <Route path="/dashboard" element={
        activeUser ? (
          <DashboardLayout user={activeUser} isDarkMode={isDarkMode} onToggleTheme={() => setIsDarkMode((v) => !v)} activeTab="home">
            <Dashboard activeTab="home" user={activeUser} />
          </DashboardLayout>
        ) : <Navigate to="/" />
      } />

      <Route path="/messages" element={
        activeUser ? (
          <DashboardLayout user={activeUser} isDarkMode={isDarkMode} onToggleTheme={() => setIsDarkMode((v) => !v)} activeTab="messages">
            <Dashboard activeTab="messages" user={activeUser} />
          </DashboardLayout>
        ) : <Navigate to="/" />
      } />

      {/* Ye route doosre users ki profile open karne ke liye hai */}
      <Route path="/profile/:handle" element={
        activeUser ? (
          <DashboardLayout user={activeUser} isDarkMode={isDarkMode} onToggleTheme={() => setIsDarkMode((v) => !v)} activeTab="profile">
            <Dashboard activeTab="profile" user={activeUser} />
          </DashboardLayout>
        ) : <Navigate to="/" />
      } />

      {/* Ye route khud ki profile open karne ke liye hai */}
      <Route path="/profile" element={
        activeUser ? <Navigate to={`/profile/${activeUser.handle}`} /> : <Navigate to="/" />
      } />

      {/* Wildcard fallback - agar URL galat ho toh dashboard bhej do */}
      <Route path="/*" element={ activeUser ? <Navigate to="/dashboard" /> : <Navigate to="/" /> } />
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