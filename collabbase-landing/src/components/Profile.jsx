import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Edit3, Github, Linkedin, ExternalLink, Activity, Plus, 
  Youtube, Globe, Camera, Image as ImageIcon, Video, FileText, 
  X, MessageSquareQuote, Sparkles, GraduationCap
} from 'lucide-react';

// Helper to detect which icon to show based on URL
const getLinkIcon = (url) => {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('github.com')) return <Github size={18} />;
  if (lowerUrl.includes('linkedin.com')) return <Linkedin size={18} className="text-[#0A66C2]" />;
  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) return <Youtube size={18} className="text-[#FF0000]" />;
  return <Globe size={18} className="text-slate-500" />;
};

export default function Profile({ currentUser, isOwnProfile = true }) {
  // Modal States
  const [activeModal, setActiveModal] = useState(null); // 'edit-profile', 'add-link', 'create-post', 'write-feedback'

  // Safe Fallbacks
  const fullName = currentUser?.fullName || 'Nishika Jain';
  const handle = currentUser?.handle || 'nishikaaa48';
  const branch = currentUser?.branch || 'Information Technology with AI & Robotics';
  const tagline = currentUser?.tagline || `Student at MITS Gwalior | ${branch}`;
  const about = currentUser?.about || "I am a B.Tech student exploring tech. Eager to learn and collaborate.";
  const initials = fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  // Mock Data arrays (These will come from your DB later)
  const links = [
    { id: 1, title: 'GitHub', url: 'https://github.com/nishikajn42' },
    { id: 2, title: 'My Portfolio', url: 'https://mywebsite.com' }
  ];
  const receivedFeedbacks = []; // e.g., [{ text: "Great teammate!", author: "Armaan" }]
  const givenFeedbacks = [];
  const posts = [];

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      
      {/* ==================== 1. HEADER (COVER & AVATAR) ==================== */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800/80 dark:bg-[#0b1120]">
        
        {/* Cover Photo */}
        <div className="group relative h-32 w-full bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-slate-800 dark:to-slate-700 sm:h-48">
          {isOwnProfile && (
            <button className="absolute right-4 top-4 hidden h-8 w-8 items-center justify-center rounded-full bg-white/80 text-slate-700 backdrop-blur-md transition hover:bg-white group-hover:flex dark:bg-slate-900/80 dark:text-slate-200">
              <Camera size={15} />
            </button>
          )}
        </div>

        <div className="relative px-6 pb-6 pt-16 sm:px-8 sm:pt-20">
          {/* Avatar */}
          <div className="group absolute -top-16 left-6 flex h-28 w-28 items-center justify-center rounded-full border-4 border-white bg-blue-600 text-3xl font-bold text-white shadow-md dark:border-[#0b1120] sm:-top-20 sm:left-8 sm:h-36 sm:w-36 sm:text-5xl">
            {initials}
            {isOwnProfile && (
              <button className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-slate-700 hover:bg-slate-200 dark:border-[#0b1120] dark:bg-slate-800 dark:text-slate-300">
                <Camera size={14} />
              </button>
            )}
          </div>

          {/* Edit Profile Button */}
          {isOwnProfile && (
            <button 
              onClick={() => setActiveModal('edit-profile')}
              className="absolute right-6 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <Edit3 size={16} />
            </button>
          )}

          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{fullName}</h1>
              <p className="font-mono text-sm font-semibold text-blue-600 dark:text-blue-400">@{handle}</p>
              <p className="mt-1.5 max-w-lg text-sm text-slate-800 dark:text-slate-200">{tagline}</p>
            </div>
            <div className="mt-4 flex items-center gap-3 sm:mt-0 sm:max-w-[200px]">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-slate-800">
                <GraduationCap size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-xs font-semibold leading-tight text-slate-700 dark:text-slate-300">
                Madhav Institute of Technology and Science
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== 2. CONNECT & PORTFOLIO (Dynamic Links) ==================== */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-[#0b1120] sm:p-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Connect & Portfolio</h2>
          {isOwnProfile && (
            <button onClick={() => setActiveModal('add-link')} className="flex items-center gap-1.5 rounded-lg text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400">
              <Plus size={16} /> Add link
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          {links.map(link => (
            <a key={link.id} href={link.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
              {getLinkIcon(link.url)}
              {link.title}
              <ExternalLink size={14} className="ml-1 text-slate-400" />
            </a>
          ))}
        </div>
      </div>

      {/* ==================== 3. GITHUB ANALYSIS (Coming Soon - Highlight Box) ==================== */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-[#0b1120] p-1 shadow-lg">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_50%)]"></div>
        <div className="relative flex flex-col items-center justify-center rounded-xl bg-slate-900/50 p-8 text-center backdrop-blur-xl sm:p-12">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
            <Sparkles size={28} />
          </div>
          <h2 className="text-xl font-bold text-white sm:text-2xl">AI-Powered GitHub Analysis</h2>
          <p className="mt-2 max-w-md text-sm text-slate-400">
            Connect your GitHub to generate an interactive, AI-driven breakdown of your coding style, top languages, and true project contributions.
          </p>
          <button className="mt-6 rounded-xl bg-white/10 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20">
            Coming Soon
          </button>
        </div>
      </div>

      {/* ==================== 4. THE 3-TIER TEXT SECTIONS ==================== */}
      
      {/* Box 1: Received Feedback (Read-Only) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-[#0b1120] sm:p-8">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
          <MessageSquareQuote size={18} className="text-blue-500" /> Feedback Received
        </h2>
        {receivedFeedbacks.length === 0 ? (
          <p className="mt-4 text-sm italic text-slate-500">No feedback received yet. Collaborate on projects to earn vouches.</p>
        ) : (
          <div className="mt-4 space-y-4">{/* Render feedbacks here */}</div>
        )}
      </div>

      {/* Box 2: About (Editable) */}
      <div className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-[#0b1120] sm:p-8">
        {isOwnProfile && (
          <button onClick={() => setActiveModal('edit-about')} className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <Edit3 size={18} />
          </button>
        )}
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">About</h2>
        <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-slate-400">{about}</p>
      </div>

      {/* Box 3: Given Feedback (Editable) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-[#0b1120] sm:p-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
            <MessageSquareQuote size={18} className="text-indigo-500" /> Feedback Given
          </h2>
          {isOwnProfile && (
            <button onClick={() => setActiveModal('write-feedback')} className="flex items-center gap-1.5 rounded-lg text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400">
              <Plus size={16} /> Write feedback
            </button>
          )}
        </div>
        {givenFeedbacks.length === 0 ? (
          <p className="text-sm italic text-slate-500">You haven't written feedback for anyone yet. Tag a teammate with @username to vouch for them.</p>
        ) : (
          <div className="mt-4 space-y-4">{/* Render given feedbacks here */}</div>
        )}
      </div>

      {/* ==================== 5. POSTS / ACTIVITY ==================== */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-[#0b1120] sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Activity</h2>
          {isOwnProfile && (
            <button onClick={() => setActiveModal('create-post')} className="rounded-full border border-blue-600 px-4 py-1.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20">
              Create a post
            </button>
          )}
        </div>
        
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 py-12 dark:border-slate-700">
            <div className="mb-3 rounded-full bg-slate-100 p-3 dark:bg-slate-800">
              <Activity size={24} className="text-slate-400" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">No posts yet</h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Posts {isOwnProfile ? "you" : handle} create will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">{/* Map Posts Here */}</div>
        )}
      </div>

      {/* ==================== MODALS ==================== */}
      <AnimatePresence>
        {activeModal === 'create-post' && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
              {/* LinkedIn Style Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">{initials}</div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{fullName}</p>
                    <p className="text-xs text-slate-500">Post to Anyone</p>
                  </div>
                </div>
                <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
              </div>
              {/* Text Area */}
              <div className="p-4">
                <textarea 
                  autoFocus 
                  placeholder="Share your thoughts, projects, or hackathon updates..." 
                  className="min-h-[150px] w-full resize-none bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
                />
              </div>
              {/* Toolbar */}
              <div className="flex items-center justify-between px-4 pb-4">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <button className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-800"><ImageIcon size={20} /></button>
                  <button className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-800"><Video size={20} /></button>
                  <button className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-800"><FileText size={20} /></button>
                </div>
                <button className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">Post</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}