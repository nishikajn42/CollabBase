import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Github, Sparkles, GraduationCap, ArrowRight, CheckCircle2, AlertCircle, User, AtSign } from 'lucide-react';

const currentYearNum = new Date().getFullYear();
const startYearOptions = Array.from({ length: 10 }, (_, i) => 2020 + i);

const Onboarding = ({ user, onComplete, isDarkMode }) => {
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '', // Defaults to Google Name, but empty string if missing
    handle: '', // The permanent Instagram-style @username
    enrollmentNo: '',
    branch: 'Information Technology with AI & Robotics',
    year: '1st Year',
    startYear: currentYearNum,
    endYear: currentYearNum + 4,
    githubUsername: '', 
  });

  const [ghStatus, setGhStatus] = useState({ loading: false, verified: false, error: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-adjust End Year when Start Year changes
  const handleStartYearChange = (e) => {
    const sYear = parseInt(e.target.value, 10);
    setFormData((prev) => ({ ...prev, startYear: sYear, endYear: sYear + 4 }));
  };

  // Live GitHub Username Verification
  const verifyGitHubUser = async () => {
    const username = formData.githubUsername.trim();
    if (!username) {
      setGhStatus({ loading: false, verified: false, error: 'Enter a GitHub username first.' });
      return;
    }

    setGhStatus({ loading: true, verified: false, error: '' });
    try {
      const res = await fetch(`https://api.github.com/users/${username}`);
      if (res.ok) {
        setGhStatus({ loading: false, verified: true, error: '' });
      } else {
        setGhStatus({ loading: false, verified: false, error: `User '${username}' not found.` });
      }
    } catch {
      setGhStatus({ loading: false, verified: false, error: 'API connection failed.' });
    }
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ghStatus.verified) {
      setError('Please verify your GitHub Username before continuing.');
      return;
    }
    if (!formData.handle.trim()) {
      setError('Please create a unique @username handle.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('import.meta.env.VITE_API_URL/api/auth/complete-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?._id, ...formData }),
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      
      onComplete(data.user); // Triggers App.jsx to load the Dashboard!
    } catch (err) {
      setError(err.message || 'Server error during setup.');
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f6f8fc] px-5 py-12 text-slate-900 transition-colors duration-300 dark:bg-[#080d18] dark:text-slate-100 sm:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-lg rounded-[24px] border border-white/75 bg-white/80 p-8 shadow-2xl backdrop-blur-2xl dark:border-white/[0.09] dark:bg-slate-900/70 sm:p-10"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
            <Sparkles size={22} />
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">Step 2 of 2</span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">Complete Profile</h1>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm text-rose-700 dark:border-rose-400/25 dark:bg-rose-500/10 dark:text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Full Name */}
          <div>
            <label className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <User size={15} /> Full Name (Display Name)
            </label>
            <input
              type="text"
              placeholder="e.g. John Doe"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm dark:border-slate-700/70 dark:bg-slate-950/50"
            />
          </div>

          {/* Instagram Style Permanent Username */}
          <div>
            <label className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <AtSign size={15} /> Unique Handle (Permanent)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-sm text-slate-400">@</span>
              <input
                type="text"
                placeholder="username123"
                required
                value={formData.handle}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  // Force lowercase, remove spaces and special chars (except underscore and period)
                  handle: e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, '') 
                })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-8 pr-4 font-mono text-sm focus:border-blue-500 focus:outline-none dark:border-slate-700/70 dark:bg-slate-950/50"
              />
            </div>
            <p className="mt-1.5 text-[10px] text-slate-500">This will be your unique profile URL and used for tagging you in posts.</p>
          </div>

          {/* Enrollment */}
          <div>
            <label className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <GraduationCap size={15} /> Enrollment Number
            </label>
            <input
              type="text"
              placeholder="e.g. 0901IT25xxxx"
              required
              value={formData.enrollmentNo}
              onChange={(e) => setFormData({ ...formData, enrollmentNo: e.target.value.toUpperCase() })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm dark:border-slate-700/70 dark:bg-slate-950/50"
            />
          </div>

          {/* Branch */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Branch</label>
            <select
              value={formData.branch}
              onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm dark:border-slate-700/70 dark:bg-slate-950/50"
            >
              <option value="Information Technology with AI & Robotics">IT (AI & Robotics)</option>
              <option value="Computer Science & Eng.">CSE</option>
              <option value="Artificial Intelligence & ML">AI & ML</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Electronics & Comm. Eng.">ECE</option>
              <option value="Mathematics and Computing">MAC</option>
            </select>
          </div>

          {/* Year Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Current Year</label>
              <select value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-slate-700/70 dark:bg-slate-950/50">
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Start</label>
              <select value={formData.startYear} onChange={handleStartYearChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-slate-700/70 dark:bg-slate-950/50">
                {startYearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">End</label>
              <select value={formData.endYear} onChange={(e) => setFormData({ ...formData, endYear: parseInt(e.target.value, 10) })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-slate-700/70 dark:bg-slate-950/50">
                {Array.from({ length: 6 }, (_, i) => formData.startYear + 1 + i).map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          {/* GitHub Verification */}
          <div>
            <label className="mb-1.5 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-2"><Github size={15} /> GitHub Username *</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. torvalds"
                required
                value={formData.githubUsername}
                onChange={(e) => {
                  setFormData({ ...formData, githubUsername: e.target.value });
                  setGhStatus({ loading: false, verified: false, error: '' });
                }}
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-700/70 dark:bg-slate-950/50"
              />
              <button
                type="button"
                onClick={verifyGitHubUser}
                disabled={ghStatus.loading || ghStatus.verified}
                className={`rounded-xl px-4 py-2.5 text-xs font-semibold text-white transition-colors ${
                  ghStatus.verified 
                    ? 'bg-emerald-600 hover:bg-emerald-700' 
                    : 'bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600'
                }`}
              >
                {ghStatus.loading ? 'Checking...' : ghStatus.verified ? 'Verified ✓' : 'Verify'}
              </button>
            </div>
            {ghStatus.error && <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400"><AlertCircle size={13} /> {ghStatus.error}</p>}
          </div>

          <motion.button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving Profile...' : 'Launch Dashboard'}
            <ArrowRight size={16} />
          </motion.button>
        </form>
      </motion.div>
    </main>
  );
};

export default Onboarding;