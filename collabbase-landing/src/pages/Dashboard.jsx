import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Edit3, Github, Linkedin, ExternalLink, Activity, 
  GraduationCap, Send, Plus, Sparkles, MessageCircle,
  Youtube, Globe, Camera, Image as ImageIcon, Video, FileText, 
  X, MessageSquareQuote, Search, Hash, AtSign, Award, BrainCircuit, Bookmark, CheckCircle2, AlertCircle, Filter, Cpu, Download, ThumbsUp, MessageSquare, Share2
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Added to sync profile data

// --- HELPERS ---
const formatUrl = (url) => {
  if (!url) return '#';
  let formatted = url.trim();
  return (!formatted.startsWith('http://') && !formatted.startsWith('https://')) ? `https://${formatted}` : formatted;
};

const getLinkIcon = (url) => {
  if (!url) return <Globe size={18} className="text-slate-500" />;
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('github.com')) return <Github size={18} />;
  if (lowerUrl.includes('linkedin.com')) return <Linkedin size={18} className="text-[#0A66C2]" />;
  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) return <Youtube size={18} className="text-[#FF0000]" />;
  return <Globe size={18} className="text-slate-500" />;
};

const getCoderBadge = (langs) => langs?.length > 0 ? `${langs[0].name} Developer` : "Developer";

const simulateAITagGeneration = (text) => {
  const lowerText = text.toLowerCase();
  const tags = new Set();
  if (lowerText.includes('react') || lowerText.includes('frontend')) tags.add('#react');
  if (lowerText.includes('node') || lowerText.includes('backend')) tags.add('#backend');
  if (lowerText.includes('ml') || lowerText.includes('ai')) tags.add('#machinelearning');
  if (tags.size === 0) tags.add('#project');
  return Array.from(tags).join(' ');
};

// 1. MESSAGES COMPONENT
function BlueprintPostCard({ post }) {
  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#1a1f2e]">
      
      {/* TOP BANNER (Timer & Urgency) based on image blueprints */}
      {post.deadline && (
        <div className={`px-4 py-2 text-center text-sm font-bold text-white ${post.urgency === 'high' ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-gradient-to-r from-amber-600 to-orange-700'}`}>
          {post.urgency === 'high' ? '🔥 Urgent: ' : '⏳ Deadline approaching: '}
          {post.deadline}
        </div>
      )}

      <div className="p-5">
        {/* POST TEXT */}
        <p className="text-base text-slate-800 dark:text-slate-100">{post.content}</p>

        {/* MEDIA / DOCUMENT SECTION */}
        {post.mediaType === 'image' && (
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
            <img src={post.mediaUrl} alt="Post media" className="w-full object-cover" />
          </div>
        )}
        
        {post.mediaType === 'document' && (
          <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg text-white font-bold text-xs ${post.docExt === 'PDF' ? 'bg-red-500' : 'bg-blue-500'}`}>
                {post.docExt}
              </div>
              <span className="font-semibold text-slate-700 dark:text-slate-200">{post.docName}</span>
            </div>
            <button className="rounded-lg p-2 hover:bg-slate-200 dark:hover:bg-slate-700"><Download size={18} className="text-slate-500" /></button>
          </div>
        )}

        {/* MULTI-COLORED GLOWING TAGS */}
        <div className="mt-5 flex flex-wrap gap-2">
          {post.tags.map((tag, idx) => (
            <span key={idx} className={`rounded-full border px-3 py-1 text-xs font-bold shadow-[0_0_8px_rgba(0,0,0,0.1)] backdrop-blur-sm 
              ${idx % 4 === 0 ? 'border-orange-500/50 text-orange-500 dark:shadow-[0_0_8px_rgba(249,115,22,0.3)]' : 
                idx % 4 === 1 ? 'border-emerald-500/50 text-emerald-500 dark:shadow-[0_0_8px_rgba(16,185,129,0.3)]' :
                idx % 4 === 2 ? 'border-blue-500/50 text-blue-500 dark:shadow-[0_0_8px_rgba(59,130,246,0.3)]' : 
                'border-purple-500/50 text-purple-500 dark:shadow-[0_0_8px_rgba(168,85,247,0.3)]'}`}>
              #{tag}
            </span>
          ))}
        </div>

        {/* ACTION BUTTONS */}
        <div className="mt-5 flex items-center gap-6 border-t border-slate-100 pt-4 text-slate-500 dark:border-slate-800 dark:text-slate-400">
          <button className="hover:text-blue-500"><ThumbsUp size={20} /></button>
          <button className="hover:text-blue-500"><MessageSquare size={20} /></button>
          <button className="ml-auto hover:text-blue-500"><Share2 size={20} /></button>
        </div>
      </div>
    </div>
  );
}
function Messages() {
  return (
    <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-[#0b1120]">
      <MessageCircle size={48} className="mx-auto mb-4 text-blue-500 opacity-50" />
      <h2 className="text-xl font-bold text-slate-900 dark:text-white">Messages</h2>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Your direct messages will appear here.</p>
    </div>
  );
}

// 2. PROFILE COMPONENT
function Profile({ currentUser, isOwnProfile = true, profileHandle = null }) {
  const { updateUser } = useAuth(); // NEW: To sync photo globally
  const [userData, setUserData] = useState(isOwnProfile ? currentUser : null);
  const [isLoadingUser, setIsLoadingUser] = useState(!isOwnProfile);
  const [userNotFound, setUserNotFound] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [githubData, setGithubData] = useState(null);
  const [ghLoading, setGhLoading] = useState(false);

  const [editForm, setEditForm] = useState({
    tagline: '', about: '', newLinkTitle: '', newLinkUrl: '', feedbackUser: '', feedbackText: '', githubUsername: '', newSkill: '', newInterest: ''
  });
  
  // States for Post UI in Profile
  const [draft, setDraft] = useState(localStorage.getItem('postDraft') || ''); // Naya (LocalStorage read karega):
  const [showAiConfirm, setShowAiConfirm] = useState(false);

  useEffect(() => {
    if (!isOwnProfile && profileHandle) {
      setIsLoadingUser(true);
      fetch(`${import.meta.env.VITE_API_URL}/api/auth/user/${profileHandle}`)
        .then(res => res.json())
        .then(data => {
          if (!data || data.error) setUserNotFound(true);
          else setUserData(data);
          setIsLoadingUser(false);
        }).catch(() => { setUserNotFound(true); setIsLoadingUser(false); });
    } else {
      setUserData(currentUser);
      setIsLoadingUser(false);
    }
  }, [profileHandle, isOwnProfile, currentUser]);

  useEffect(() => {
    if (userData) {
      setEditForm(prev => ({
        ...prev, tagline: userData.tagline || '', about: userData.about || '', githubUsername: userData.githubUsername || ''
      }));
    }
  }, [userData]);

  // Fetch GitHub Analysis automatically if username exists
  useEffect(() => {
    if (userData?.githubUsername) {
      setGhLoading(true);
      fetch(`${import.meta.env.VITE_API_URL}/api/github/analyze/${userData.githubUsername}`)
        .then(res => res.json())
        .then(data => {
          if (!data.error) setGithubData(data);
          setGhLoading(false);
        }).catch(() => setGhLoading(false));
    }
  }, [userData?.githubUsername]);

  const handleSaveProfile = async (updates) => {
    if (!isOwnProfile) return;
    const newUserData = { ...userData, ...updates };
    setUserData(newUserData); 
    updateUser(updates); // Sync with top right navbar instantly!
    setActiveModal(null);
    
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/auth/update-profile`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: userData._id, ...updates })
      });
    } catch (error) { console.error('Failed to save to DB', error); }
  };

  // NAYA FUNCTION: Delete karne ke liye
  const handleRemoveItem = (field, itemToRemove) => {
    if (field === 'links') {
      handleSaveProfile({ links: userData.links.filter(link => link.title !== itemToRemove.title) });
    } else {
      handleSaveProfile({ [field]: userData[field].filter(item => item !== itemToRemove) });
    }
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

  if (isLoadingUser) return <div className="py-20 text-center">Loading...</div>;
  if (userNotFound || !userData) return <div className="py-20 text-center font-bold">User not found</div>;

  const cleanName = (userData.fullName || 'User Name').replace(userData.enrollmentNo || '', '').trim(); 
  const initials = cleanName.substring(0, 2).toUpperCase();

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      
      {/* 1. HEADER */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#0b1120]">
        <div className="group relative h-32 w-full bg-slate-200 sm:h-48 dark:bg-slate-800" style={userData.coverPhoto ? { backgroundImage: `url(${userData.coverPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
          {isOwnProfile && (
            <label className="absolute right-4 top-4 hidden h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white/80 group-hover:flex">
              <Camera size={15} /> <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, 'cover')} />
            </label>
          )}
        </div>
        <div className="relative px-6 pb-6 pt-16 sm:px-8 sm:pt-20">
          <div className="absolute -top-16 left-6 flex h-28 w-28 items-center justify-center rounded-full border-4 border-white bg-blue-600 text-3xl font-bold text-white sm:-top-20 sm:left-8 sm:h-36 sm:w-36 dark:border-[#0b1120]">
            {userData.profilePicture ? <img src={userData.profilePicture} className="h-full w-full rounded-full object-cover" /> : initials}
            {isOwnProfile && (
              <label className="absolute bottom-2 right-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-slate-100 text-slate-700 dark:border-[#0b1120] dark:bg-slate-800 dark:text-white"><Camera size={14} /><input type="file" className="hidden" onChange={(e) => handleImageUpload(e, 'avatar')} /></label>
            )}
          </div>
          {isOwnProfile && <button onClick={() => setActiveModal('edit-profile')} className="absolute right-6 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"><Edit3 size={16} /></button>}
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{cleanName}</h1>
            <p className="mt-1 text-sm font-mono font-semibold text-blue-600 dark:text-blue-400">@{userData.handle}</p>
            <p className="mt-2 text-sm text-slate-800 dark:text-slate-200">{userData.tagline || 'Student at MITS Gwalior'}</p>
          </div>
        </div>
      </div>

      {/* 2. AREA OF INTEREST */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#0b1120] sm:p-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold dark:text-white"><Sparkles size={18} className="text-purple-500" /> Area of Interest</h2>
          {isOwnProfile && <button onClick={() => setActiveModal('edit-interests')} className="text-slate-400 hover:text-purple-500"><Edit3 size={18} /></button>}
        </div>
        {(!userData.interests || userData.interests.length === 0) ? (
          <p className="text-sm italic text-slate-500">No interests added yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {userData.interests.map((interest, i) => (
              <div key={i} className="flex items-center gap-1 rounded-md bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700 dark:bg-purple-900/20 dark:text-purple-300">
                #{interest}
                {isOwnProfile && <X size={14} className="cursor-pointer text-purple-400 hover:text-red-500" onClick={() => handleRemoveItem('interests', interest)} />}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. GITHUB CYBERPUNK BOX */}
      <div className="relative overflow-hidden rounded-2xl bg-[#060a14] border border-blue-500/20 p-8 shadow-[0_0_30px_-5px_rgba(59,130,246,0.15)] text-white">
        <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-blue-600/20 blur-[70px] rounded-full pointer-events-none"></div>
        {ghLoading ? <div className="text-center text-sm font-mono text-blue-400">CONNECTING TO GITHUB...</div> : githubData ? (
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
               <div className="flex items-center gap-4">
                 {githubData.avatarUrl ? <img src={githubData.avatarUrl} className="h-14 w-14 rounded-xl border border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]" /> : <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-800 border border-blue-500/30"><Github size={28} /></div>}
                 <div>
                   <h3 className="font-bold text-lg tracking-wide">{githubData.name || githubData.username}</h3>
                   <p className="text-xs text-blue-400 font-mono tracking-widest">@{githubData.username}</p>
                 </div>
               </div>
               <span className="hidden sm:flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase text-emerald-400 backdrop-blur-md shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                 <Sparkles size={12} /> {getCoderBadge(githubData.topLanguages)}
               </span>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-8">
               <div className="group relative overflow-hidden bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-sm transition-all hover:bg-white/10 hover:border-blue-500/40">
                  <span className="block text-3xl font-black text-white group-hover:text-blue-400 transition-colors">{githubData.publicRepos}</span>
                  <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mt-1 block">Repositories</span>
               </div>
               <div className="group relative overflow-hidden bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-sm transition-all hover:bg-white/10 hover:border-amber-500/40">
                  <span className="block text-3xl font-black text-amber-400 group-hover:drop-shadow-[0_0_8px_rgba(251,191,36,0.5)] transition-all">{githubData.totalStars}</span>
                  <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mt-1 block">Total Stars</span>
               </div>
               <div className="group relative overflow-hidden bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-sm transition-all hover:bg-white/10 hover:border-emerald-500/40">
                  <span className="block text-3xl font-black text-emerald-400 group-hover:drop-shadow-[0_0_8px_rgba(52,211,153,0.5)] transition-all">{githubData.followers}</span>
                  <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mt-1 block">Followers</span>
               </div>
            </div>

            {githubData.topLanguages?.length > 0 && (
              <div>
                <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-3">Top Tech Stack</p>
                <div className="flex flex-wrap gap-2">
                  {githubData.topLanguages.map((lang, idx) => (
                    <div key={idx} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-sm">
                      <span className="text-xs font-bold text-white">{lang.name}</span>
                      <span className="text-[10px] font-mono text-blue-400">{lang.percent}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6 relative z-10">
            <Github size={32} className="mx-auto mb-3 text-slate-500" />
            <h3 className="font-bold text-lg mb-1">{!userData?.githubUsername ? "GitHub Not Linked" : "Analysis Failed"}</h3>
            <p className="text-xs text-slate-400 mb-4">Link your GitHub to generate an AI-powered developer card.</p>
            {isOwnProfile && <button onClick={() => setActiveModal('edit-profile')} className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-colors">Update GitHub Username</button>}
          </div>
        )}
      </div>

      {/* 4. SKILLS */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#0b1120] sm:p-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold dark:text-white"><Cpu size={18} className="text-blue-500" /> Skills & Tech Stack</h2>
          {isOwnProfile && <button onClick={() => setActiveModal('edit-skills')} className="text-slate-400 hover:text-blue-500"><Edit3 size={18} /></button>}
        </div>
        {(!userData.skills || userData.skills.length === 0) ? (
          <p className="text-sm italic text-slate-500">No skills added yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {userData.skills.map((skill, i) => (
              <div key={i} className="flex items-center gap-1 rounded-full bg-slate-100 px-4 py-1.5 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {skill}
                {isOwnProfile && <X size={14} className="cursor-pointer text-slate-400 hover:text-red-500" onClick={() => handleRemoveItem('skills', skill)} />}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. CONNECT & PORTFOLIO */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#0b1120] sm:p-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold dark:text-white">Connect & Portfolio</h2>
          {isOwnProfile && <button onClick={() => setActiveModal('add-link')} className="text-sm font-semibold text-blue-600 hover:text-blue-700"><Plus size={16} className="inline"/> Add link</button>}
        </div>
        {(!userData.links || userData.links.length === 0) ? (
          <p className="text-sm italic text-slate-500">No portfolio links added yet.</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {userData.links.map((link, idx) => (
              <div key={idx} className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200 dark:bg-slate-800/50">
                <a href={formatUrl(link.url)} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-blue-500">
                  {getLinkIcon(link.url)} {link.title} <ExternalLink size={12} className="ml-1 text-slate-400" />
                </a>
                {isOwnProfile && <X size={14} className="ml-2 cursor-pointer text-slate-400 hover:text-red-500" onClick={() => handleRemoveItem('links', link)} />}
              </div>
            ))}
          </div>
        )}
      </div>
      {/* 6. FEEDBACK RECEIVED (Reordered to top) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#0b1120] sm:p-8">
        <h2 className="flex items-center gap-2 text-lg font-bold dark:text-white"><MessageSquareQuote size={18} className="text-blue-500" /> Feedback Received</h2>
        {(!userData.receivedFeedbacks || userData.receivedFeedbacks.length === 0) ? (
          <p className="mt-4 text-sm italic text-slate-500">No feedback received yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {userData.receivedFeedbacks.map((fb, idx) => (
              <div key={idx} className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                <p>{fb.text}</p>
                <span className="mt-2 block font-mono text-[10px] font-bold text-blue-500">From @{fb.fromUser}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 7. ABOUT (Reordered to middle) */}
      <div className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#0b1120] sm:p-8">
        {isOwnProfile && <button onClick={() => setActiveModal('edit-about')} className="absolute right-6 top-6 text-slate-400 hover:text-blue-500 transition-colors"><Edit3 size={18} /></button>}
        <h2 className="text-lg font-bold dark:text-white">About</h2>
        <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-slate-400">{userData.about || 'Write something about yourself...'}</p>
      </div>

      {/* 8. FEEDBACK GIVEN (Reordered to bottom) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#0b1120] sm:p-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold dark:text-white"><MessageSquareQuote size={18} className="text-indigo-500" /> Feedback Given</h2>
          {isOwnProfile && <button onClick={() => setActiveModal('write-feedback')} className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-500"><Plus size={16}/> Write feedback</button>}
        </div>
        {(!userData.givenFeedbacks || userData.givenFeedbacks.length === 0) ? (
          <p className="text-sm italic text-slate-500">No feedback given yet.</p>
        ) : (
          <div className="space-y-3">
            {userData.givenFeedbacks.map((fb) => (
              <div key={fb.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                <Link to={`/profile/${fb.taggedUser}`} className="font-mono text-xs font-bold text-blue-500 hover:underline">@{fb.taggedUser}</Link>
                <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{fb.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 9. POSTS (Unified with Feed UI) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#0b1120] sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold dark:text-white">Activity & Posts</h2>
          {isOwnProfile && (
            <button onClick={() => setActiveModal('create-post')} className="rounded-full border border-blue-600 px-4 py-1.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20">
              Create a post
            </button>
          )}
        </div>
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 py-12 dark:border-slate-700">
          <Activity size={24} className="mb-3 text-slate-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">No posts yet</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Posts will appear here.</p>
        </div>
      </div>

      {/* MODALS */}
      <AnimatePresence>
        {activeModal && isOwnProfile && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
              <div className="flex justify-between p-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold dark:text-white capitalize">{activeModal.replace('-', ' ')}</h3>
                <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
              </div>
              
              <div className="p-4 space-y-4">
                {activeModal === 'create-post' && (
                   <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:bg-[#0b1120] dark:border-slate-800">
                     <textarea 
                        autoFocus 
                        value={draft} 
                        onChange={(e) => setDraft(e.target.value)} 
                        placeholder="Need a teammate? Describe your project..." 
                        className="min-h-[120px] w-full resize-none bg-transparent text-sm outline-none dark:text-white" 
                     />
                     
                     {showAiConfirm && (
                       <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="my-3 flex items-center justify-between rounded-lg bg-indigo-50 border border-indigo-100 p-3 dark:bg-indigo-900/30 dark:border-indigo-800">
                         <div className="flex items-center gap-2"><AlertCircle size={16} className="text-indigo-600" /><p className="text-xs font-semibold text-indigo-700">Add AI tags?</p></div>
                         <div className="flex gap-2">
                           <button onClick={() => setShowAiConfirm(false)} className="text-xs font-bold text-slate-500">Cancel</button>
                           <button onClick={() => { setDraft(prev => `${prev}\n\n${simulateAITagGeneration(draft)}`); setShowAiConfirm(false); }} className="rounded bg-indigo-600 px-3 py-1 text-xs font-bold text-white">Yes</button>
                         </div>
                       </motion.div>
                     )}

                     <div className="mt-3 flex justify-between items-center border-t border-slate-200/50 pt-3 dark:border-slate-700/50">
                       <div className="flex items-center gap-4 text-slate-400">
                          <label className="cursor-pointer hover:text-blue-500"><ImageIcon size={18}/><input type="file" hidden accept="image/*"/></label>
                          <button type="button" onClick={() => setShowAiConfirm(true)} disabled={!draft.trim()} className="flex items-center gap-1.5 rounded-lg bg-purple-50 px-2 py-1 text-xs font-bold text-purple-600 disabled:opacity-50 dark:bg-purple-900/30 dark:text-purple-400"><BrainCircuit size={14}/> AI Auto-Tag</button>
                       </div>
                       
                       <div className="flex gap-2">
                         <button 
                           onClick={() => { localStorage.setItem('postDraft', draft); setActiveModal(null); }} 
                           className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
                         >
                           <Bookmark size={14}/> Save Draft
                         </button>
                         <button 
                           onClick={() => { setActiveModal(null); setDraft(''); localStorage.removeItem('postDraft'); }} 
                           disabled={!draft.trim()} 
                           className="flex items-center gap-1.5 bg-blue-600 text-white px-5 py-2 rounded-xl text-xs font-bold disabled:opacity-50 hover:bg-blue-700"
                         >
                           <Send size={14}/> Post
                         </button>
                       </div>
                     </div>
                   </div>
                )}
                {/* Keep existing inputs for edit-profile, edit-about, write-feedback here... */}
                {activeModal === 'edit-profile' && (
                  <>
                    <input type="text" placeholder="Tagline" value={editForm.tagline} onChange={(e) => setEditForm({...editForm, tagline: e.target.value})} className="w-full rounded-xl border border-slate-200 p-3 text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
                    <input type="text" placeholder="GitHub Username" value={editForm.githubUsername} onChange={(e) => setEditForm({...editForm, githubUsername: e.target.value})} className="w-full rounded-xl border border-slate-200 p-3 text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
                  </>
                )}
                {activeModal === 'edit-skills' && (
                  <div className="flex gap-2">
                    <input type="text" placeholder="e.g. React" value={editForm.newSkill} onChange={(e) => setEditForm({...editForm, newSkill: e.target.value})} className="w-full border border-slate-200 rounded-xl p-3 text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
                    <button onClick={() => { if(editForm.newSkill) { handleSaveProfile({skills: [...(userData.skills||[]), editForm.newSkill]}); setEditForm({...editForm, newSkill: ''})}}} className="bg-blue-600 text-white px-4 rounded-xl font-bold">Add</button>
                  </div>
                )}
                {activeModal === 'edit-interests' && (
                  <div className="flex gap-2">
                    <input type="text" placeholder="e.g. Machine Learning" value={editForm.newInterest} onChange={(e) => setEditForm({...editForm, newInterest: e.target.value})} className="w-full border border-slate-200 rounded-xl p-3 text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
                    <button onClick={() => { if(editForm.newInterest) { handleSaveProfile({interests: [...(userData.interests||[]), editForm.newInterest]}); setEditForm({...editForm, newInterest: ''})}}} className="bg-purple-600 text-white px-4 rounded-xl font-bold">Add</button>
                  </div>
                )}
                {activeModal === 'add-link' && (
                  <div className="space-y-3">
                    <input type="text" placeholder="Link Title (e.g. Github)" value={editForm.newLinkTitle} onChange={(e) => setEditForm({...editForm, newLinkTitle: e.target.value})} className="w-full rounded-xl border border-slate-200 p-3 text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
                    <input type="text" placeholder="URL (e.g. https://...)" value={editForm.newLinkUrl} onChange={(e) => setEditForm({...editForm, newLinkUrl: e.target.value})} className="w-full rounded-xl border border-slate-200 p-3 text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
                    
                    {/* YEH BUTTON REPLACE KARO */}
                    <button 
                      onClick={() => { 
                        if(editForm.newLinkTitle && editForm.newLinkUrl) { 
                          handleSaveProfile({ links: [...(userData.links||[]), { title: editForm.newLinkTitle, url: editForm.newLinkUrl }] }); 
                          setEditForm({...editForm, newLinkTitle: '', newLinkUrl: ''});
                        }
                      }} 
                      className="mt-2 w-full rounded-xl bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700"
                    >
                      Save Changes
                    </button>
                  </div>
                )}
                {activeModal === 'edit-about' && <textarea rows={5} value={editForm.about} onChange={(e) => setEditForm({...editForm, about: e.target.value})} className="w-full rounded-xl border border-slate-200 p-3 text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-white" />}
              </div>
              
              {activeModal !== 'create-post' && (
                <div className="flex justify-end p-4 border-t border-slate-100 bg-slate-50 dark:bg-slate-800/50 dark:border-slate-800">
                  <button onClick={() => {
                    if (activeModal === 'edit-profile') handleSaveProfile({ tagline: editForm.tagline, githubUsername: editForm.githubUsername });
                    if (activeModal === 'edit-about') handleSaveProfile({ about: editForm.about });
                  }} className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition">Save Changes</button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// 3. HOME FEED COMPONENT 
function Home({ currentUser }) {
  // E-commerce style algorithm: Combine User's Skills & Interests into active filters automatically
  const userTags = [...(currentUser?.skills || []), ...(currentUser?.interests || [])].map(tag => tag.toLowerCase());
  
  // Dummy Data (Backend se aayega future mein). Based on your images!
  const allPosts = [
    {
      id: 1,
      urgency: 'high',
      deadline: '6 days, 42 hours, 7 min left',
      content: 'Seeking a Data Scientist collaborator to help refine our deep learning project pipeline.',
      mediaType: 'document',
      docName: 'Project_Scope_&_Dataset.pdf',
      docExt: 'PDF',
      tags: ['MachineLearning', 'DataMining', 'TechCollab']
    },
    {
      id: 2,
      urgency: 'medium',
      deadline: '6 days, 42 hours, 7 min left',
      content: 'Join our hackathon squad! We need a skilled Data Scientist to optimize our predictive models.',
      mediaType: 'image',
      mediaUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800',
      tags: ['DataAnalytics', 'DataScientist', 'Hackathon2026']
    }
  ];

  // FACET FILTER ALGORITHM: 
  // If user has NO tags in profile, show all posts.
  // If user HAS tags, show only posts that share AT LEAST ONE tag with the user (Intersection)
  const filteredPosts = userTags.length === 0 
    ? allPosts 
    : allPosts.filter(post => 
        post.tags.some(tag => userTags.includes(tag.toLowerCase()))
      );

  return (
    <div className="mx-auto max-w-3xl pb-20">
      
      {/* Filter Status UI */}
      <div className="mb-6 flex items-center justify-between rounded-xl bg-blue-50 px-4 py-3 dark:bg-blue-900/20">
        <div className="flex items-center gap-2 text-sm font-semibold text-blue-700 dark:text-blue-400">
          <Filter size={16} />
          {userTags.length > 0 
            ? `Showing posts tailored to your ${userTags.length} skills & interests` 
            : 'Showing all posts (Add skills to your profile for AI matching)'}
        </div>
        <span className="rounded-md bg-white px-2 py-1 text-xs font-bold text-slate-700 shadow-sm dark:bg-slate-800 dark:text-slate-300">
          {filteredPosts.length} Results
        </span>
      </div>

      {/* Render Posts */}
      {filteredPosts.length > 0 ? (
        filteredPosts.map(post => <BlueprintPostCard key={post.id} post={post} />)
      ) : (
        <div className="text-center py-20">
          <AlertCircle size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="font-bold dark:text-white">No exact matches found</h3>
          <p className="text-sm text-slate-500 mt-2">Try adding different skills to your profile to see more posts.</p>
        </div>
      )}
    </div>
  );
}


// 4. MAIN EXPORT ROUTER
export default function Dashboard({ activeTab, user }) { 
  const location = useLocation();
  const isProfileRoute = location.pathname.startsWith('/profile/');
  const profileHandle = isProfileRoute ? location.pathname.split('/')[2] : null;
  const isOwnProfile = !profileHandle || profileHandle === user?.handle;

  if (activeTab === 'messages' && !isProfileRoute) return <Messages />;
  if (activeTab === 'profile' || isProfileRoute) return <Profile currentUser={user} isOwnProfile={isOwnProfile} profileHandle={profileHandle} />; 
  return <Home currentUser={user} />; 
}