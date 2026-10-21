import React, { useState, useEffect } from 'react';
import { Home, MessageSquare, User as UserIcon, Sun, Moon, Search, LogOut, ChevronDown } from 'lucide-react';
import Footer from '../components/Footer';

const DashboardLayout = ({ user, isDarkMode, onToggleTheme, activeTab, setActiveTab, onBackToLanding, children }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [greeting, setGreeting] = useState('Good evening');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else if (hour < 21) setGreeting('Good evening');
    else setGreeting('Good night');
  }, []);

  const fullName = user?.fullName || 'Nishika Jain';
  const initials = fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <div className="flex min-h-screen flex-col bg-[#f4f7f9] font-sans text-slate-900 transition-colors duration-300 dark:bg-[#060a14] dark:text-slate-100">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 h-16 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-xl dark:border-slate-800/80 dark:bg-[#0b1120]/95">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
          <div className="flex items-center gap-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
              <span className="font-bold">CB</span>
            </div>
            <div className="hidden sm:block">
              <span className="block text-sm font-bold leading-none dark:text-white">CollabBase</span>
            </div>
          </div>

          <nav className="flex items-center gap-2">
            {['home', 'messages', 'profile'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex flex-col items-center gap-1 rounded-xl px-4 py-1.5 text-xs font-semibold capitalize transition ${
                  activeTab === tab ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                }`}
              >
                {tab === 'home' && <Home size={18} />}
                {tab === 'messages' && <MessageSquare size={18} />}
                {tab === 'profile' && <UserIcon size={18} />}
                <span className="hidden md:inline">{tab === 'home' ? 'Feed' : tab}</span>
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button onClick={onToggleTheme} className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            
            <div className="relative">
              <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="flex items-center gap-2 rounded-full p-0.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  {initials}
                </div>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900">
                  <button onClick={onBackToLanding} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10">
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {/* SDMS Style Greeting Banner (Only on Feed) */}
        {activeTab === 'home' && (
          <div className="mb-6 overflow-hidden rounded-[20px] bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shadow-lg sm:p-8">
            <div className="mb-2 flex items-center gap-3">
              <span className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold tracking-wider backdrop-blur-md">STUDENT PORTAL</span>
              <span className="rounded-full bg-black/20 px-3 py-1 text-[10px] font-bold tracking-wider backdrop-blur-md">{user?.enrollmentNo || 'BTIR25O1033'}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {greeting}, {fullName.toUpperCase()}! 👋
            </h1>
            <p className="mt-2 text-sm text-blue-100">Find hackathon teammates, post projects, and build your verified portfolio.</p>
          </div>
        )}

        {children}
      </main>

      <Footer />
    </div>
  );
};

export default DashboardLayout;