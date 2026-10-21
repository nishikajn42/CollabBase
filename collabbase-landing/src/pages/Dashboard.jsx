import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Edit3, Github, Linkedin, ExternalLink, Activity, 
  GraduationCap, Send, Plus, Sparkles, MessageCircle,
  Youtube, Globe, Camera, Image as ImageIcon, Video, FileText, 
  X, MessageSquareQuote, Search, Hash, AtSign, Code2, Star,
  FolderGit2, Users, Award
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

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
// HELPER: GITHUB DYNAMIC BADGE
// ==========================================
const getCoderBadge = (langs) => {
  if (!langs || langs.length === 0) return "Explorer";
  const topLang = langs[0].name.toLowerCase();
  if (['javascript', 'typescript', 'html', 'css', 'react', 'vue'].includes(topLang)) return "Frontend Specialist";
  if (['python', 'java', 'c++', 'go', 'rust', 'c'].includes(topLang)) return "Backend Developer";
  return "Open Source Contributor";
};

// ==========================================
// 1. LINKEDIN-STYLE PROFILE COMPONENT
// ==========================================
function Profile({ currentUser, isOwnProfile = true, profileHandle = null }) {
  const [userData, setUserData] = useState(isOwnProfile ? currentUser : null);
  const [isLoadingUser, setIsLoadingUser] = useState(!isOwnProfile);
  const [activeModal, setActiveModal] = useState(null);
  
  const [githubData, setGithubData] = useState(null);
  const [ghLoading, setGhLoading] = useState(false);

  const [editForm, setEditForm] = useState({
    tagline: '', about: '', newLinkTitle: '', newLinkUrl: '', feedbackUser: '', feedbackText: '', githubUsername: ''
  });

  // Fetch Public Profile Data if looking at someone else
  useEffect(() => {
    if (!isOwnProfile && profileHandle) {
      setIsLoadingUser(true);
      fetch(`import.meta.env.VITE_API_URL/api/auth/user/${profileHandle}`)
        .then(res => res.json())
        .then(data => {
          if (!data.error) setUserData(data);
          setIsLoadingUser(false);
        })
        .catch(() => setIsLoadingUser(false));
    } else {
      setUserData(currentUser);
      setIsLoadingUser(false);
    }
  }, [profileHandle, isOwnProfile, currentUser]);

  // Sync edit form when userData loads
  useEffect(() => {
    if (userData) {
      setEditForm(prev => ({
        ...prev,
        tagline: userData.tagline || '',
        about: userData.about || '',
        githubUsername: userData.githubUsername || ''
      }));
    }
  }, [userData]);

  // Fetch Live GitHub Analysis
  useEffect(() => {
    if (userData?.githubUsername) {
      setGhLoading(true);
      fetch(`import.meta.env.VITE_API_URL/api/github/analyze/${userData.githubUsername}`)
        .then(res => res.json())
        .then(data => {
          if (!data.error) setGithubData(data);
          setGhLoading(false);
        })
        .catch(() => setGhLoading(false));
    }
  }, [userData?.githubUsername]);

  const handleSaveProfile = async (updates) => {
    if (!isOwnProfile) return;
    const newUserData = { ...userData, ...updates };
    setUserData(newUserData); 
    setActiveModal(null);
    try {
      await fetch('import.meta.env.VITE_API_URL/api/auth/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userData._id, ...updates })
      });
    } catch (error) { console.error('Failed to save to database', error); }
  };

  const handleDeleteLink = (linkToDelete) => {
    const newLinks = userData.links.filter(l => l.url !== linkToDelete.url);
    handleSaveProfile({ links: newLinks });
  };

  const handleSaveGivenFeedback = () => {
    if (!editForm.feedbackUser || !editForm.feedbackText) return;
    const newFeedback = {
      id: Date.now(),
      taggedUser: editForm.feedbackUser.replace('@', '').trim(),
      text: editForm.feedbackText,
      date: new Date().toLocaleDateString()
    };
    const updatedGiven = [newFeedback, ...(userData?.givenFeedbacks || [])];
    handleSaveProfile({ givenFeedbacks: updatedGiven });
    setEditForm({ ...editForm, feedbackUser: '', feedbackText: '' });
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

  // Show loading screen if fetching another user
  if (isLoadingUser || !userData) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600 dark:border-slate-800 dark:border-t-blue-500"></div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading profile @{profileHandle}...</p>
      </div>
    );
  }

  const rawName = userData.fullName || 'Display Name';
  const enrollmentNo = userData.enrollmentNo || 'Campus Student';
  const cleanName = rawName.replace(enrollmentNo, '').trim(); 
  const handle = userData.handle || userData.githubUsername || 'username'; 
  const branch = userData.branch || 'Branch Name';
  const tagline = userData.tagline || `Student at MITS Gwalior | ${branch}`;
  const about = userData.about || "Write something about yourself, your skills, and what you are building...";
  const initials = cleanName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  const dbLinks = userData.links || [];
  const givenFeedbacks = userData.givenFeedbacks || [];
  const receivedFeedbacks = userData.receivedFeedbacks || [];

  const allLinks = userData.githubUsername 
    ? [{ _id: 'gh-auto', title: 'GitHub Profile', url: `https://github.com/${userData.githubUsername}` }, ...dbLinks]
    : dbLinks;

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
            ) : initials}
            
            {isOwnProfile && (
              <label className="absolute bottom-2 right-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-slate-100 text-slate-700 shadow-sm hover:bg-slate-200 dark:border-[#0b1120] dark:bg-slate-800 dark:text-slate-300">
                <Camera size={14} />
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'avatar')} />
              </label>
            )}
          </div>

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
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{cleanName}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{enrollmentNo}</p>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">
                  @{handle}
                </span>
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

      {/* ----------------- DYNAMIC GITHUB AI ANALYSIS BOX ----------------- */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0b1120] p-[1px] shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/40 via-purple-500/10 to-emerald-500/40 opacity-50"></div>
        <div className="relative rounded-2xl bg-slate-900/90 p-6 backdrop-blur-2xl sm:p-8">
          
          {ghLoading ? (
            <div className="py-12 text-center text-sm font-medium text-slate-400">Syncing with GitHub...</div>
          ) : githubData ? (
            <div className="space-y-8">
              
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  {githubData.avatarUrl ? (
                    <img src={githubData.avatarUrl} alt="GitHub Avatar" className="h-14 w-14 rounded-full border border-slate-700/50 shadow-lg" />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full border border-slate-700/50 bg-slate-800 text-slate-400 shadow-lg"><Github size={24} /></div>
                  )}
                  <div>
                    <h3 className="flex items-center gap-3 text-base font-bold text-white">
                      {githubData.name || githubData.username}
                      <span className="flex items-center gap-1 rounded-md border border-blue-500/30 bg-blue-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-400 backdrop-blur-md">
                        <Award size={12} /> {getCoderBadge(githubData.topLanguages)}
                      </span>
                    </h3>
                    <p className="font-mono text-xs text-slate-400">@{githubData.username}</p>
                  </div>
                </div>
                <Sparkles size={20} className="text-blue-400 opacity-80" />
              </div>

              {githubData.bio && (
                <p className="text-sm leading-relaxed text-slate-300">{githubData.bio}</p>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col items-start justify-center rounded-xl border border-slate-700/50 bg-slate-800/30 p-4 shadow-inner">
                  <FolderGit2 size={16} className="mb-3 text-blue-400" />
                  <span className="text-2xl font-black tracking-tight text-white">{githubData.publicRepos}</span>
                  <span className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Repositories</span>
                </div>
                <div className="flex flex-col items-start justify-center rounded-xl border border-slate-700/50 bg-slate-800/30 p-4 shadow-inner">
                  <Star size={16} className="mb-3 text-amber-400" />
                  <span className="text-2xl font-black tracking-tight text-amber-400">{githubData.totalStars}</span>
                  <span className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total Stars</span>
                </div>
                <div className="flex flex-col items-start justify-center rounded-xl border border-slate-700/50 bg-slate-800/30 p-4 shadow-inner">
                  <Users size={16} className="mb-3 text-emerald-400" />
                  <span className="text-2xl font-black tracking-tight text-emerald-400">{githubData.followers}</span>
                  <span className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Followers</span>
                </div>
              </div>

              <div>
                <p className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">Language Distribution</p>
                <div className="space-y-4">
                  {githubData.topLanguages?.map((lang, idx) => {
                    const glowColors = [
                      'bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.8)]',
                      'bg-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.8)]',
                      'bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]',
                      'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]'
                    ];
                    const colorClass = glowColors[idx % glowColors.length];

                    return (
                      <div key={lang.name} className="flex items-center gap-4">
                        <div className="w-24 text-xs font-semibold text-slate-200">{lang.name}</div>
                        <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800/80">
                          <div style={{ width: `${lang.percent}%` }} className={`absolute left-0 top-0 h-full rounded-full ${colorClass}`} />
                        </div>
                        <div className="w-12 text-right font-mono text-xs font-bold text-slate-400">{lang.percent}%</div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-800 border border-slate-700 shadow-inner">
                <Github size={28} className="text-slate-400" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-white">{isOwnProfile ? 'Connect GitHub' : 'GitHub Not Linked'}</h3>
              <p className="mb-6 max-w-sm text-sm leading-relaxed text-slate-400">
                {isOwnProfile ? 'Link your account to unlock real-time analysis, contribution signals, and dynamic platform badges.' : `${cleanName} hasn't linked their GitHub account yet.`}
              </p>
              {isOwnProfile && (
                <button onClick={() => setActiveModal('edit-profile')} className="rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-slate-900 shadow-lg transition hover:bg-slate-200">
                  Link Account Now
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ----------------- 3-TIER TEXT SECTIONS ----------------- */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-[#0b1120] sm:p-8">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
          <MessageSquareQuote size={18} className="text-blue-500" /> Feedback Received
        </h2>
        {receivedFeedbacks.length === 0 ? (
          <p className="mt-4 text-sm italic text-slate-500">No feedback received yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {receivedFeedbacks.map((fb, idx) => (
              <div key={idx} className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                <p>{fb.text}</p>
                <span className="mt-1 block text-[10px] text-blue-500">From @{fb.fromUser}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-[#0b1120] sm:p-8">
        {isOwnProfile && (
          <button onClick={() => setActiveModal('edit-about')} className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
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
            <button onClick={() => setActiveModal('write-feedback')} className="flex items-center gap-1.5 rounded-lg text-sm font-semibold text-blue-600 transition hover:text-blue-700 dark:text-blue-400">
              <Plus size={16} /> Write feedback
            </button>
          )}
        </div>
        {givenFeedbacks.length === 0 ? (
          <p className="text-sm italic text-slate-500">{isOwnProfile ? "You haven't written feedback for anyone yet." : `${cleanName} hasn't given feedback to anyone yet.`}</p>
        ) : (
          <div className="space-y-3">
            {givenFeedbacks.map((fb) => (
              <div key={fb.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                <div className="flex items-center justify-between">
                  <Link to={`/profile/${fb.taggedUser}`} className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
                    @{fb.taggedUser}
                  </Link>
                  <span className="text-[10px] text-slate-400">{fb.date}</span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-700 dark:text-slate-300">{fb.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>

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
        {activeModal && isOwnProfile && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
              
              <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-blue-600 text-sm font-bold text-white">
                    {userData.profilePicture ? <img src={userData.profilePicture} alt="Avatar" className="h-full w-full object-cover" /> : initials}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{cleanName}</p>
                    <p className="text-xs text-slate-500">
                      {activeModal === 'write-feedback' ? 'Write Teammate Feedback' : 'Modal Editor'}
                    </p>
                  </div>
                </div>
                <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
              </div>

              <div className="p-4">
                {activeModal === 'create-post' && (
                  <textarea autoFocus placeholder="Share your thoughts, projects, or hackathon updates... Use #tags like #frontend or #ai" className="min-h-[150px] w-full resize-none bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white" />
                )}
                {activeModal === 'edit-profile' && (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-500">Name and Enrollment can only be changed by contacting support.</p>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">Tagline</label>
                      <input type="text" placeholder="Tagline" value={editForm.tagline} onChange={(e) => setEditForm({ ...editForm, tagline: e.target.value })} className="w-full rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">GitHub Username</label>
                      <input type="text" placeholder="e.g. nishikajn42" value={editForm.githubUsername} onChange={(e) => setEditForm({ ...editForm, githubUsername: e.target.value })} className="w-full rounded-xl border border-slate-200 p-3 text-sm font-mono dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                    </div>
                  </div>
                )}
                {activeModal === 'edit-about' && (
                  <textarea autoFocus placeholder="Write about yourself..." value={editForm.about} onChange={(e) => setEditForm({ ...editForm, about: e.target.value })} className="min-h-[150px] w-full resize-none rounded-xl border border-slate-200 p-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                )}
                {activeModal === 'add-link' && (
                  <div className="space-y-4">
                    <input type="text" placeholder="Link Title (e.g., YouTube)" value={editForm.newLinkTitle} onChange={(e) => setEditForm({ ...editForm, newLinkTitle: e.target.value })} className="w-full rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                    <input type="url" placeholder="URL (e.g., https://youtube.com/...)" value={editForm.newLinkUrl} onChange={(e) => setEditForm({ ...editForm, newLinkUrl: e.target.value })} className="w-full rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                  </div>
                )}
                {activeModal === 'write-feedback' && (
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">Teammate @username</label>
                      <input type="text" placeholder="e.g. nishikajn42" value={editForm.feedbackUser} onChange={(e) => setEditForm({ ...editForm, feedbackUser: e.target.value })} className="w-full rounded-xl border border-slate-200 p-3 text-sm font-mono dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">Feedback / Vouch</label>
                      <textarea rows={4} placeholder="Write your experience working together..." value={editForm.feedbackText} onChange={(e) => setEditForm({ ...editForm, feedbackText: e.target.value })} className="w-full resize-none rounded-xl border border-slate-200 p-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/50">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400"></div>
                <button 
                  onClick={() => {
                    if (activeModal === 'edit-profile') handleSaveProfile({ tagline: editForm.tagline, githubUsername: editForm.githubUsername });
                    if (activeModal === 'edit-about') handleSaveProfile({ about: editForm.about });
                    if (activeModal === 'add-link' && editForm.newLinkTitle) {
                      const newLink = { title: editForm.newLinkTitle, url: editForm.newLinkUrl };
                      handleSaveProfile({ links: [...dbLinks, newLink] });
                      setEditForm({ ...editForm, newLinkTitle: '', newLinkUrl: '' });
                    }
                    if (activeModal === 'write-feedback') handleSaveGivenFeedback();
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
// 2. HOME FEED COMPONENT WITH SEARCH BAR
// ==========================================
function Home({ currentUser }) {
  const [draft, setDraft] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState([]); 

  const filteredPosts = searchQuery.startsWith('#')
    ? posts.filter(p => p.text.toLowerCase().includes(searchQuery.toLowerCase()))
    : posts;

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-12">
      <div className="relative rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800/80 dark:bg-[#0b1120]">
        <div className="flex items-center gap-3">
          <Search size={18} className="ml-2 text-slate-400" />
          <input type="text" placeholder="Search users by @username or posts by #tag..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white" />
          {searchQuery && <button onClick={() => setSearchQuery('')} className="mr-2 text-xs font-bold text-slate-400 hover:text-slate-600">Clear</button>}
        </div>
        {searchQuery.startsWith('@') && searchQuery.length > 1 && (
          <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <p className="text-[11px] text-slate-400 mb-2">User Search Result:</p>
            <Link to={`/profile/${searchQuery.replace('@', '')}`} className="flex items-center gap-2 rounded-lg p-2 hover:bg-slate-50 dark:hover:bg-slate-800">
              <AtSign size={16} className="text-blue-500" />
              <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">View profile for {searchQuery}</span>
            </Link>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800/80 dark:bg-[#0b1120]">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-blue-600 text-xs font-bold text-white">
            {currentUser?.profilePicture ? <img src={currentUser.profilePicture} alt="User" /> : "CS"}
          </div>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Post a Hackathon Idea</p>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); setPosts([{ id: Date.now(), text: draft, author: currentUser?.fullName || 'User', handle: currentUser?.handle || 'me', time: 'Just now' }, ...posts]); setDraft(''); }}>
          <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="What are you building? Add tags like #frontend or #ai" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-blue-500" />
          <div className="mt-3 flex justify-between items-center">
            <div className="flex items-center gap-2 text-slate-400">
              <label className="cursor-pointer hover:text-blue-500"><ImageIcon size={18}/><input type="file" hidden accept="image/*"/></label>
            </div>
            <button type="submit" disabled={!draft.trim()} className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"><Send size={14} /> Post</button>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <motion.div key={post.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-[#0b1120]">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                {post.author} 
                <Link to={`/profile/${post.handle}`} className="font-mono text-blue-500 font-normal hover:underline ml-1">@{post.handle}</Link>
              </p>
              <span className="text-[10px] text-slate-400">{post.time}</span>
            </div>
            <p className="mt-2 text-sm text-slate-700 dark:text-slate-200 whitespace-pre-line">{post.text}</p>
          </motion.div>
        ))}
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
  const location = useLocation();
  
  // Check if the URL is trying to view a public profile
  const isProfileRoute = location.pathname.startsWith('/profile/');
  const profileHandle = isProfileRoute ? location.pathname.split('/')[2] : null;

  // Determine if this is YOUR profile or SOMEONE ELSE's
  const isOwnProfile = !profileHandle || profileHandle === user?.handle;

  if (activeTab === 'messages' && !isProfileRoute) return <Messages currentUser={user} />; 
  
  // Render Profile tab if clicked in navigation OR if URL matches a handle
  if (activeTab === 'profile' || isProfileRoute) {
    return <Profile currentUser={user} isOwnProfile={isOwnProfile} profileHandle={profileHandle} />; 
  }
  
  return <Home currentUser={user} />; 
}