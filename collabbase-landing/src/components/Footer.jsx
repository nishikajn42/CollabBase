import React from 'react';

const Footer = () => {
  return (
    <footer className="mt-auto w-full border-t border-slate-200/50 bg-white py-6 dark:border-slate-800/80 dark:bg-[#0b1120]">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:px-6 md:flex-row lg:px-8">
        
        {/* Left Side: Brand & Org */}
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
            <span className="text-sm font-bold">CB</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">CollabBase Platform</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">MITS-DU, Gwalior</p>
          </div>
        </div>

        {/* Right Side: Description */}
        <div className="text-center md:text-right">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            The Official AI Matchmaking platform of MITS-DU, Gwalior for <br className="hidden md:block" />
            monitoring student team formation through verified projects.
          </p>
        </div>

      </div>

      <div className="mx-auto mt-6 max-w-7xl border-t border-slate-100 px-4 pt-4 text-center text-[11px] text-slate-400 dark:border-slate-800/50 sm:px-6 md:flex md:justify-center md:gap-2 lg:px-8">
        <p>© 2026 CollabBase, MITS Gwalior.</p>
        <span className="hidden md:inline">|</span>
        <p>Developed by <span className="font-semibold text-slate-500 dark:text-slate-300">Nishika Jain</span></p>
      </div>
    </footer>
  );
};

export default Footer;