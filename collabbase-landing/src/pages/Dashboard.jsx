import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Edit3, Github, Linkedin, ExternalLink, Activity, 
  GraduationCap, Send, Plus, Sparkles, MessageCircle,
  Youtube, Globe, Camera, Image as ImageIcon, Video, FileText, 
  X, MessageSquareQuote 
} from 'lucide-react';

// ==========================================
// HELPER: DYNAMIC LINK ICON DETECTOR
// ==========================================
const getLinkIcon = (url) => {
  if (!url) return <Globe size={18} className="text-slate-500" />;
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('github.com')) return <Github size={18} />;
  if (lowerUrl.includes('linkedin.com')) return <Linkedin size={18} className="text-[#0A66C2]" />;
  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) return <Youtube size={18} className="text-[#FF0000]" />;
  return <Globe size={18} className="text-slate-500" />;
};

// ==========================================
// 1. LINKEDIN-STYLE PROFILE COMPONENT
// ==========================================
function Profile({ currentUser, isOwnProfile = true }) {
  const [userData, setUserData] = useState(currentUser);
  const [activeModal, setActiveModal] = useState(null);
  
  const [editForm, setEditForm] = useState({
    tagline: userData?.tagline || '',
    about: userData?.about || '',
    newLinkTitle: '',
    newLinkUrl: ''
  });

  const rawName = userData?.fullName || 'Display Name';
  const enrollmentNo = userData?.enrollmentNo || 'Campus Student';
  const cleanName = rawName.replace(enrollmentNo, '').trim(); 
  
  const handle = userData?.handle || userData?.githubUsername || 'username'; 
  const branch = userData?.branch || 'Branch Name';
  const tagline = userData?.tagline || `Student at MITS Gwalior | ${branch}`;
  const about = userData?.about || "Write something about yourself, your skills, and what you are building...";
  const initials = cleanName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  const dbLinks = userData?.links || [];
  const allLinks = userData?.githubUsername 
    ? [{ _id: 'gh-auto', title: 'GitHub', url: `https://github.com/${userData.githubUsername}` }, ...dbLinks]
    : dbLinks;

  const handleSaveProfile = async (updates) => {
    const newUserData = { ...userData, ...updates };
    setUserData(newUserData); 
    setActiveModal(null);

    try {
      await fetch('http://localhost:5000/api/auth/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userData._id, ...updates })
      });
    } catch (error) {
      console.error('Failed to save to database', error);
    }
  };

  // Delete Link Function
  const handleDeleteLink = (linkToDelete) => {
    const newLinks = dbLinks.filter(l => l.url !== linkToDelete.url);
    handleSaveProfile({ links: newLinks });
  };

  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'avatar') handleSaveProfile({ profilePicture: reader.result });
        if (type === 'cover') handleSaveProfile({ coverPhoto: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      
      {/* ----------------- HEADER (COVER & AVATAR) ----------------- */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800/80 dark:bg-[#0b1120]">
        
        <div 
          className="group relative h-32 w-full bg-gradient-to-r from-blue-100 to-indigo-100 bg-cover bg-center dark:from-slate-800 dark:to-slate-700 sm:h-48"
          style={userData.coverPhoto ? { backgroundImage: `url(${userData.coverPhoto})` } : {}}
        >
          {isOwnProfile && (
            <label className="absolute right-4 top-4 hidden h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white/80 text-slate-700 backdrop-blur-md transition hover:bg-white group-hover:flex dark:bg-slate-900/80 dark:text-slate-200">
              <Camera size={15} />
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'cover')} />
            </label>
          )}
        </div>

        <div className="relative px-6 pb-6 pt-16 sm:px-8 sm:pt-20">
          <div className="group absolute -top-16 left-6 flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-blue-600 text-3xl font-bold text-white shadow-md dark:border-[#0b1120] sm:-top-20 sm:left-8 sm:h-36 sm:w-36 sm:text-5xl">
            {userData.profilePicture ? (
              <img src={userData.profilePicture} alt={cleanName} className="h-full w-full object-cover" />
            ) : (
              initials
            )}
            {isOwnProfile && (
              <label className="absolute bottom-2 right-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-slate-100 text-slate-700 shadow-sm hover:bg-slate-200 dark:border-[#0b1120] dark:bg-slate-800 dark:text-slate-300">
                <Camera size={14} />
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'avatar')} />
              </label>
            )}
          </div>

          {isOwnProfile && (
            <button 
              onClick={() => { setEditForm({ ...editForm, tagline }); setActiveModal('edit-profile'); }}
              className="absolute right-6 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <Edit3 size={16} />
            </button>
          )}

          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{cleanName}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{enrollmentNo}</p>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                
                {/* 🔗 Clickable Username Routing */}
                <a href={`/profile/${handle}`} className="font-mono text-xs font-semibold text-blue-600 transition hover:underline dark:text-blue-400">
                  @{handle}
                </a>
                
              </div>
              <p className="mt-2 max-w-lg text-sm font-medium text-slate-800 dark:text-slate-200">{tagline}</p>
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

      {/* ----------------- CONNECT & PORTFOLIO ----------------- */}
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
          {allLinks.map(link => (
            <div key={link._id || link.url} className="group relative flex items-center">
              <a 
                href={link.url} 
                target="_blank" 
                rel="noreferrer" 
                className={`flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 ${isOwnProfile && link._id !== 'gh-auto' ? 'pr-10' : ''}`}
              >
                <span className="flex items-center justify-center transition-transform group-hover:scale-110">
                  {getLinkIcon(link.url)}
                </span>
                {link.title}
                <ExternalLink size={14} className="ml-1 text-slate-400" />
              </a>
              
              {/* ❌ Delete Button (Appears on Hover) */}
              {isOwnProfile && link._id !== 'gh-auto' && (
                <button 
                  onClick={() => handleDeleteLink(link)}
                  className="absolute right-3 flex h-5 w-5 items-center justify-center rounded-full bg-slate-200/50 text-slate-500 opacity-0 transition-opacity hover:bg-red-100 hover:text-red-600 group-hover:opacity-100 dark:bg-slate-700 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                  title="Delete link"
                >
                  <X size={12} strokeWidth={2.5} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ----------------- GITHUB AI BOX ----------------- */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-[#0b1120] p-1 shadow-lg">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_50%)]"></div>
        <div className="relative flex flex-col items-center justify-center rounded-xl bg-slate-900/50 p-8 text-center backdrop-blur-xl sm:p-12">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
            <Sparkles size={28} />
          </div>
          <h2 className="text-xl font-bold text-white sm:text-2xl">AI-Powered GitHub Analysis</h2>
          <p className="mt-2 max-w-md text-sm text-slate-400">
            Generating an interactive breakdown of @{handle}'s coding style, top languages, and true project contributions.
          </p>
          <button className="mt-6 rounded-xl bg-white/10 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20">
            Coming Soon
          </button>
        </div>
      </div>

      {/* ----------------- 3-TIER TEXT SECTIONS ----------------- */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-[#0b1120] sm:p-8">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
          <MessageSquareQuote size={18} className="text-blue-500" /> Feedback Received
        </h2>
        <p className="mt-4 text-sm italic text-slate-500">No feedback received yet.</p>
      </div>

      <div className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-[#0b1120] sm:p-8">
        {isOwnProfile && (
          <button onClick={() => { setEditForm({ ...editForm, about }); setActiveModal('edit-about'); }} className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <Edit3 size={18} />
          </button>
        )}
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">About</h2>
        <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-slate-400">{about}</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-[#0b1120] sm:p-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
            <MessageSquareQuote size={18} className="text-indigo-500" /> Feedback Given
          </h2>
          {isOwnProfile && (
            <button className="flex items-center gap-1.5 rounded-lg text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400">
              <Plus size={16} /> Write feedback
            </button>
          )}
        </div>
        <p className="text-sm italic text-slate-500">You haven't written feedback for anyone yet. Tag a teammate with @username to vouch for them.</p>
      </div>

      {/* ----------------- POSTS & ACTIVITY ----------------- */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-[#0b1120] sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Activity</h2>
          {isOwnProfile && (
            <button onClick={() => setActiveModal('create-post')} className="rounded-full border border-blue-600 px-4 py-1.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20">
              Create a post
            </button>
          )}
        </div>
        
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 py-12 dark:border-slate-700">
          <div className="mb-3 rounded-full bg-slate-100 p-3 dark:bg-slate-800">
            <Activity size={24} className="text-slate-400" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">No posts yet</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Posts {isOwnProfile ? "you" : handle} create will appear here.</p>
        </div>
      </div>

      {/* ----------------- MODALS ----------------- */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
              
              <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-blue-600 text-sm font-bold text-white">
                    {userData.profilePicture ? <img src={userData.profilePicture} alt="Avatar" className="h-full w-full object-cover" /> : initials}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{cleanName}</p>
                    <p className="text-xs text-slate-500">Modal Editor</p>
                  </div>
                </div>
                <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
              </div>

              <div className="p-4">
                {activeModal === 'create-post' && (
                  <textarea autoFocus placeholder="Share your thoughts, projects, or hackathon updates..." className="min-h-[150px] w-full resize-none bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white" />
                )}
                {activeModal === 'edit-profile' && (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-500">Name, Enrollment, and Username can only be changed by contacting support.</p>
                    <input 
                      type="text" 
                      placeholder="Tagline (e.g. Student at MITS | CSE)" 
                      value={editForm.tagline} 
                      onChange={(e) => setEditForm({ ...editForm, tagline: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" 
                    />
                  </div>
                )}
                {activeModal === 'edit-about' && (
                  <textarea 
                    autoFocus 
                    placeholder="Write about yourself..." 
                    value={editForm.about}
                    onChange={(e) => setEditForm({ ...editForm, about: e.target.value })}
                    className="min-h-[150px] w-full resize-none rounded-xl border border-slate-200 p-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white" 
                  />
                )}
                {activeModal === 'add-link' && (
                  <div className="space-y-4">
                    <input 
                      type="text" 
                      placeholder="Link Title (e.g., YouTube)" 
                      value={editForm.newLinkTitle}
                      onChange={(e) => setEditForm({ ...editForm, newLinkTitle: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" 
                    />
                    <input 
                      type="url" 
                      placeholder="URL (e.g., https://youtube.com/...)" 
                      value={editForm.newLinkUrl}
                      onChange={(e) => setEditForm({ ...editForm, newLinkUrl: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" 
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/50">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  {activeModal === 'create-post' && (
                    <>
                      <label className="cursor-pointer rounded-full p-2 hover:bg-slate-200 dark:hover:bg-slate-800"><ImageIcon size={20} /><input type="file" className="hidden" accept="image/*" /></label>
                      <label className="cursor-pointer rounded-full p-2 hover:bg-slate-200 dark:hover:bg-slate-800"><Video size={20} /><input type="file" className="hidden" accept="video/*" /></label>
                      <label className="cursor-pointer rounded-full p-2 hover:bg-slate-200 dark:hover:bg-slate-800"><FileText size={20} /><input type="file" className="hidden" accept=".pdf,.doc,.txt" /></label>
                    </>
                  )}
                </div>
                <button 
                  onClick={() => {
                    if (activeModal === 'edit-profile') handleSaveProfile({ tagline: editForm.tagline });
                    if (activeModal === 'edit-about') handleSaveProfile({ about: editForm.about });
                    if (activeModal === 'add-link' && editForm.newLinkTitle) {
                      const newLink = { title: editForm.newLinkTitle, url: editForm.newLinkUrl };
                      handleSaveProfile({ links: [...dbLinks, newLink] });
                      setEditForm({ ...editForm, newLinkTitle: '', newLinkUrl: '' });
                    }
                    if (activeModal === 'create-post') setActiveModal(null);
                  }}
                  className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ==========================================
// 2. HOME FEED COMPONENT (Real Data Only)
// ==========================================
function Home({ currentUser }) {
  const [draft, setDraft] = useState('');
  const [posts, setPosts] = useState([]); 

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800/80 dark:bg-[#0b1120]">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-blue-600 text-xs font-bold text-white">
            {currentUser?.profilePicture ? <img src={currentUser.profilePicture} alt="User" /> : "CS"}
          </div>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Post a Hackathon Idea</p>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); setPosts([{ id: Date.now(), text: draft, author: currentUser?.fullName || 'User', time: 'Just now' }, ...posts]); setDraft(''); }}>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="What are you building? Looking for a UI designer or a MongoDB expert?"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-blue-500"
          />
          <div className="mt-3 flex justify-between items-center">
            <div className="flex items-center gap-2 text-slate-400">
              <label className="cursor-pointer hover:text-blue-500"><ImageIcon size={18}/><input type="file" hidden accept="image/*"/></label>
            </div>
            <button type="submit" disabled={!draft.trim()} className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50">
              <Send size={14} /> Post
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        {posts.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 py-16 dark:border-slate-700/70">
            <Sparkles size={28} className="mb-3 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Your feed is quiet</h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Be the first to post a project idea and find teammates.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 3. MESSAGES COMPONENT
// ==========================================
function Messages() {
  return (
    <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800/80 dark:bg-[#0b1120]">
      <div className="flex h-[60vh] flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 rounded-full bg-blue-50 p-4 dark:bg-slate-800/50">
          <MessageCircle size={32} className="text-blue-500" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">No messages yet</h2>
      </div>
    </div>
  );
}

// ==========================================
// 4. MAIN EXPORT ROUTER
// ==========================================
export default function Dashboard({ activeTab, user }) { 
  const currentUser = user || {}; 

  if (activeTab === 'messages') return <Messages currentUser={currentUser} />; 
  if (activeTab === 'profile') return <Profile currentUser={currentUser} isOwnProfile={true} />; 
  
  return <Home currentUser={currentUser} />; 
}