import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Edit3, Github, Linkedin, ExternalLink, Activity, 
  Send, Plus, Sparkles, MessageCircle, CalendarClock,
  Youtube, Globe, Camera, Image as ImageIcon,
  X, MessageSquareQuote, Search, BrainCircuit, Bookmark, AlertCircle, Cpu, ThumbsUp, MessageSquare, Share2, MoreVertical, Trash2, ArrowLeft
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 

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

// FULLY DYNAMIC AI TAGGER
const simulateAITagGeneration = (text, existingTags = []) => {
  const words = (text || "").toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);
  let potentialTags = [];
  
  const keywordMap = {
    react: 'ReactJS', frontend: 'Frontend', backend: 'Backend', node: 'NodeJS',
    api: 'API', ml: 'MachineLearning', ai: 'ArtificialIntelligence', data: 'DataScience',
    python: 'Python', hackathon: 'Hackathon', web: 'WebDevelopment', ui: 'UIUX',
    mongo: 'MongoDB', javascript: 'JavaScript', java: 'Java', c: 'C++', 
    project: 'ProjectWork', collab: 'Collaboration', app: 'AppDev'
  };

  words.forEach(w => { if (keywordMap[w]) potentialTags.push(keywordMap[w]); });
  
  // Large pool of random fallbacks
  const fallbacks = [
    'Innovation', 'Developer', 'Coding', 'OpenSource', 'Student', 'Tech', 
    'Startup', 'Engineering', 'Web3', 'Cloud', 'Design', 'Software', 'Algorithms'
  ];
  
  // Combine mapped keywords with shuffled fallbacks
  let allCandidates = [...potentialTags, ...fallbacks.sort(() => 0.5 - Math.random())];
  
  // Remove duplicates and already existing tags
  let uniqueNewTags = [...new Set(allCandidates)].filter(t => !existingTags.includes(t));
  
  // Return exactly 3 new tags each time
  return uniqueNewTags.slice(0, 3); 
};


// 1. POST CARD COMPONENT
function BlueprintPostCard({ post, currentUser, onPostDeleted }) {
  const authorName = post.author?.fullName || 'User';
  const authorHandle = post.author?.handle || 'user';
  const authorPic = post.author?.profilePicture;
  
  const isAuthor = currentUser?.handle === authorHandle;
  const [shareCount, setShareCount] = useState(post.shareCount || 0);
  const [showOptions, setShowOptions] = useState(false);

  const handleShare = async () => {
    const postUrl = `${window.location.origin}/post/${post._id}`;
    navigator.clipboard.writeText(`Check out this post by @${authorHandle}:\n\n${postUrl}`);
    setShareCount(prev => prev + 1);
    alert("Post link copied to clipboard!");
    try {
       await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${post._id}/share`, { method: 'PUT' });
    } catch (e) { console.error("Share count update failed", e) }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${post._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) onPostDeleted(post._id);
    } catch (e) { console.error(e); }
  };
  
  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#1a1f2e]">
      {post.deadline && (
        <div className="bg-amber-600/90 px-4 py-1.5 text-center text-xs font-bold text-white backdrop-blur-md">
           ⏳ Recruitment Deadline: {new Date(post.deadline).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
        </div>
      )}
      <div className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
             {authorPic ? (
               <img src={authorPic} alt={authorName} className="h-10 w-10 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
             ) : (
               <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white font-bold">
                 {authorName.substring(0,2).toUpperCase()}
               </div>
             )}
             <div>
               <p className="text-sm font-bold text-slate-900 dark:text-white">
                 <Link to={`/profile/${authorHandle}`} className="hover:underline">{authorName}</Link>
               </p>
               <Link to={`/profile/${authorHandle}`} className="text-xs font-mono text-blue-500 hover:underline">@{authorHandle}</Link>
             </div>
          </div>
          
          <div className="flex items-center gap-2 relative">
             <span className="text-xs text-slate-400">
               {new Date(post.createdAt).toLocaleDateString() === new Date().toLocaleDateString() ? 'Today' : new Date(post.createdAt).toLocaleDateString()}
             </span>
             {isAuthor && (
               <div className="relative">
                 <button onClick={() => setShowOptions(!showOptions)} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white">
                   <MoreVertical size={16} />
                 </button>
                 {showOptions && (
                   <div className="absolute right-0 top-6 z-10 w-32 rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
                     <button onClick={handleDelete} className="flex w-full items-center gap-2 px-4 py-2 text-left text-xs font-bold text-red-600 hover:bg-slate-50 dark:hover:bg-slate-700">
                       <Trash2 size={14}/> Delete Post
                     </button>
                   </div>
                 )}
               </div>
             )}
          </div>
        </div>

        <p className="whitespace-pre-line text-base text-slate-800 dark:text-slate-100">{post.content}</p>

        {post.tags && post.tags.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {post.tags.map((tag, idx) => (
              <span key={idx} className={`rounded-full border px-3 py-1 text-xs font-bold shadow-[0_0_8px_rgba(0,0,0,0.1)] backdrop-blur-sm 
                ${idx % 4 === 0 ? 'border-orange-500/50 text-orange-500' : 
                  idx % 4 === 1 ? 'border-emerald-500/50 text-emerald-500' :
                  idx % 4 === 2 ? 'border-blue-500/50 text-blue-500' : 
                  'border-purple-500/50 text-purple-500'}`}>
                {tag.startsWith('#') ? tag : `#${tag}`}
              </span>
            ))}
          </div>
        )}

        <div className="mt-5 flex items-center gap-6 border-t border-slate-100 pt-4 text-slate-500 dark:border-slate-800 dark:text-slate-400">
          <button className="flex items-center gap-2 hover:text-blue-500 transition-colors">
             <MessageSquare size={20} />
             <span className="text-xs font-semibold">Comment</span>
          </button>
          
          <button onClick={handleShare} className="ml-auto flex items-center gap-2 hover:text-blue-500 transition-colors">
             <Share2 size={20} />
             <span className="text-xs font-semibold">{shareCount} Shares</span>
          </button>
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
  const { updateUser } = useAuth(); 
  const [userData, setUserData] = useState(isOwnProfile ? currentUser : null);
  const [isLoadingUser, setIsLoadingUser] = useState(!isOwnProfile);
  const [userNotFound, setUserNotFound] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [githubData, setGithubData] = useState(null);
  const [ghLoading, setGhLoading] = useState(false);
  
  const [userPosts, setUserPosts] = useState([]);
  const [draft, setDraft] = useState(localStorage.getItem('postDraft') || ''); 
  const [draftTags, setDraftTags] = useState([]); 
  const [draftDeadline, setDraftDeadline] = useState('');
  const [isPosting, setIsPosting] = useState(false); 

  const [editForm, setEditForm] = useState({ tagline: '', about: '', newLinkTitle: '', newLinkUrl: '', githubUsername: '', newSkill: '', newInterest: '' });

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
      setEditForm(prev => ({ ...prev, tagline: userData.tagline || '', about: userData.about || '', githubUsername: userData.githubUsername || '' }));
      fetch(`${import.meta.env.VITE_API_URL}/api/posts`)
        .then(res => res.json())
        .then(data => { if(!data.error) setUserPosts(data.filter(p => p.author?.handle === userData.handle)); })
        .catch(console.error);
    }
  }, [userData]);

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
    setUserData(newUserData); updateUser(updates); setActiveModal(null);
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/auth/update-profile`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: userData._id, ...updates })
      });
    } catch (error) { console.error('Failed to save to DB', error); }
  };

  const handleRemoveItem = (field, itemToRemove) => {
    if (field === 'links') handleSaveProfile({ links: userData.links.filter(link => link.title !== itemToRemove.title) });
    else handleSaveProfile({ [field]: userData[field].filter(item => item !== itemToRemove) });
  };

  const handleCreatePost = async () => {
    if (!draft.trim() || isPosting) return;
    setIsPosting(true);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ content: draft, tags: draftTags, deadline: draftDeadline || null })
      });
      if (response.ok) {
        const newPost = await response.json();
        newPost.author = userData; 
        setUserPosts(prev => [newPost, ...prev]);
        setDraft(''); setDraftTags([]); setDraftDeadline(''); localStorage.removeItem('postDraft'); setActiveModal(null);
      }
    } catch (error) { console.error('Error posting:', error); } finally { setIsPosting(false); }
  };

  if (isLoadingUser) return <div className="py-20 text-center">Loading...</div>;
  if (userNotFound || !userData) return <div className="py-20 text-center font-bold">User not found</div>;

  const cleanName = (userData.fullName || 'User Name').replace(userData.enrollmentNo || '', '').trim(); 
  const initials = cleanName.substring(0, 2).toUpperCase();

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      
      {/* BACK BUTTON (Only shows if looking at someone else's profile) */}
      {!isOwnProfile && (
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors">
          <ArrowLeft size={16} /> Back to Feed
        </Link>
      )}

      {/* 1. HEADER */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#0b1120]">
        <div className="group relative h-32 w-full bg-slate-200 sm:h-48 dark:bg-slate-800" style={userData.coverPhoto ? { backgroundImage: `url(${userData.coverPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
          {isOwnProfile && (
            <label className="absolute right-4 top-4 hidden h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white/80 group-hover:flex">
              <Camera size={15} /> <input type="file" className="hidden" onChange={(e) => {
                const f = e.target.files[0];
                if(f) { const r = new FileReader(); r.onloadend = () => handleSaveProfile({ coverPhoto: r.result }); r.readAsDataURL(f); }
              }} />
            </label>
          )}
        </div>
        <div className="relative px-6 pb-6 pt-16 sm:px-8 sm:pt-20">
          <div className="absolute -top-16 left-6 flex h-28 w-28 items-center justify-center rounded-full border-4 border-white bg-blue-600 text-3xl font-bold text-white sm:-top-20 sm:left-8 sm:h-36 sm:w-36 dark:border-[#0b1120]">
            {userData.profilePicture ? <img src={userData.profilePicture} className="h-full w-full rounded-full object-cover" /> : initials}
            {isOwnProfile && (
              <label className="absolute bottom-2 right-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-slate-100 text-slate-700 dark:border-[#0b1120] dark:bg-slate-800 dark:text-white"><Camera size={14} /><input type="file" className="hidden" onChange={(e) => {
                const f = e.target.files[0];
                if(f) { const r = new FileReader(); r.onloadend = () => handleSaveProfile({ profilePicture: r.result }); r.readAsDataURL(f); }
              }} /></label>
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

      {/* 9. POSTS */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#0b1120] sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold dark:text-white">Activity & Posts</h2>
          {isOwnProfile && (
            <button onClick={() => setActiveModal('create-post')} className="rounded-full border border-blue-600 px-4 py-1.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20">
              Create a post
            </button>
          )}
        </div>
        {userPosts.length > 0 ? (
          userPosts.map((post) => (
            <BlueprintPostCard 
              key={post._id} 
              post={post} 
              currentUser={currentUser} 
              onPostDeleted={(id) => setUserPosts(userPosts.filter(p => p._id !== id))} 
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 py-12 dark:border-slate-700">
            <Activity size={24} className="mb-3 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">No posts yet</h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Posts will appear here.</p>
          </div>
        )}
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
                     
                     {draftTags.length > 0 && (
                        <div className="my-2 flex flex-wrap gap-2">
                           {draftTags.map(tag => (
                             <span key={tag} className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                               #{tag} <button onClick={() => setDraftTags(draftTags.filter(t => t !== tag))} className="hover:text-red-500"><X size={12}/></button>
                             </span>
                           ))}
                        </div>
                     )}
                     
                     <div className="mt-2 mb-3">
                       <label className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1"><CalendarClock size={14}/> Recruitment Deadline (Optional)</label>
                       <input type="datetime-local" value={draftDeadline} onChange={(e) => setDraftDeadline(e.target.value)} className="w-full rounded-lg border border-slate-200 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"/>
                     </div>

                     <div className="mt-3 flex justify-between items-center border-t border-slate-200/50 pt-3 dark:border-slate-700/50">
                       <button 
                          type="button" 
                          onClick={() => {
                            const newTags = simulateAITagGeneration(draft, draftTags);
                            setDraftTags([...draftTags, ...newTags]);
                          }} 
                          disabled={!draft.trim()} 
                          className="flex items-center gap-1.5 rounded-lg bg-purple-50 px-2 py-1 text-xs font-bold text-purple-600 disabled:opacity-50 dark:bg-purple-900/30 dark:text-purple-400"
                       >
                         <BrainCircuit size={14}/> AI Tag
                       </button>
                       <div className="flex gap-2">
                         <button onClick={handleCreatePost} disabled={!draft.trim() || isPosting} className="flex items-center gap-1.5 bg-blue-600 text-white px-5 py-2 rounded-xl text-xs font-bold disabled:opacity-50 hover:bg-blue-700">
                           <Send size={14}/> {isPosting ? 'Posting...' : 'Post'}
                         </button>
                       </div>
                     </div>
                   </div>
                )}
                {/* Profile Edit Modals */}
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
                    <input type="text" placeholder="Link Title" value={editForm.newLinkTitle} onChange={(e) => setEditForm({...editForm, newLinkTitle: e.target.value})} className="w-full rounded-xl border border-slate-200 p-3 text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
                    <input type="text" placeholder="URL" value={editForm.newLinkUrl} onChange={(e) => setEditForm({...editForm, newLinkUrl: e.target.value})} className="w-full rounded-xl border border-slate-200 p-3 text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
                    <button onClick={() => { if(editForm.newLinkTitle && editForm.newLinkUrl) { handleSaveProfile({ links: [...(userData.links||[]), { title: editForm.newLinkTitle, url: editForm.newLinkUrl }] }); setEditForm({...editForm, newLinkTitle: '', newLinkUrl: ''}); } }} className="mt-2 w-full rounded-xl bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700">Save Changes</button>
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
  const [draft, setDraft] = useState(localStorage.getItem('postDraft') || '');
  const [draftTags, setDraftTags] = useState([]);
  const [draftDeadline, setDraftDeadline] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  
  const [posts, setPosts] = useState([]); 
  const [isPosting, setIsPosting] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/posts`)
      .then(res => res.json())
      .then(data => { if(!data.error) setPosts(data); })
      .catch(console.error);
  }, []);

  // Live Backend Search Fetcher
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.length > 1) {
        fetch(`${import.meta.env.VITE_API_URL}/api/auth/search?q=${searchQuery}`)
          .then(res => res.json())
          .then(data => setSearchResults(data))
          .catch(console.error);
      } else {
        setSearchResults([]);
      }
    }, 400); 
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const userTags = Array.from(new Set([...(currentUser?.skills || []), ...(currentUser?.interests || [])]));
  
  const filteredPosts = posts.filter(post => {
    const contentToSearch = post.content || '';
    const matchesSearch = searchQuery ? contentToSearch.toLowerCase().includes(searchQuery.toLowerCase()) : true;
    let matchesFilter = true;
    if (activeFilter !== 'All') {
      matchesFilter = post.tags?.some(tag => tag.toLowerCase() === activeFilter.toLowerCase());
    }
    return matchesSearch && matchesFilter;
  });

  const handleCreatePost = async () => {
    if (!draft.trim() || isPosting) return;
    setIsPosting(true);
    const token = localStorage.getItem('token');
  
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ content: draft, tags: draftTags, deadline: draftDeadline || null })
      });
  
      if (response.ok) {
        const newPost = await response.json();
        newPost.author = currentUser; 
        setPosts(prev => [newPost, ...prev]);
        setDraft(''); setDraftTags([]); setDraftDeadline(''); localStorage.removeItem('postDraft');
      }
    } catch (error) { console.error('Error posting:', error); } finally { setIsPosting(false); }
  };

  return (
    <div className="mx-auto max-w-3xl pb-20 space-y-6">
      
      {/* SEARCH BAR */}
      <div className="relative z-20">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 dark:border-slate-800 dark:bg-[#0b1120]">
          <Search size={18} className="ml-2 text-slate-400" />
          <input 
            type="text" placeholder="Search posts, #tags, or people..." 
            value={searchQuery} 
            onChange={(e) => {
               setSearchQuery(e.target.value);
               setShowSearchDropdown(e.target.value.length > 1);
            }}
            onFocus={() => { if (searchQuery.length > 1) setShowSearchDropdown(true) }}
            onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
            className="w-full bg-transparent text-sm outline-none dark:text-white" 
          />
          {searchQuery && <button onClick={() => { setSearchQuery(''); setShowSearchDropdown(false); }} className="mr-2 text-xs font-bold text-slate-400">Clear</button>}
        </div>

        {/* Dropdown for Backend User matches */}
        {showSearchDropdown && searchQuery && (
          <div className="absolute top-14 left-0 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
             {searchResults.length > 0 ? (
               searchResults.map(user => (
                 <Link key={user.handle} to={`/profile/${user.handle}`} className="flex items-center gap-3 border-b border-slate-100 p-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800">
                    {user.profilePicture ? (
                       <img src={user.profilePicture} className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                       <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold dark:bg-blue-900/50 dark:text-blue-300">
                         {user.fullName?.substring(0,2).toUpperCase()}
                       </div>
                    )}
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{user.fullName}</h4>
                      <p className="text-xs text-slate-500 line-clamp-1">{user.tagline || `@${user.handle}`}</p>
                    </div>
                 </Link>
               ))
             ) : (
               <div className="p-4 text-center text-sm text-slate-500">Press enter to filter posts for "{searchQuery}"</div>
             )}
          </div>
        )}
      </div>

      {/* CREATE POST BOX IN FEED */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#0b1120]">
        <textarea 
          value={draft} onChange={(e) => setDraft(e.target.value)} 
          placeholder="Need a teammate? Describe your project..." 
          className="min-h-[100px] w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white" 
        />
        
        {draftTags.length > 0 && (
          <div className="my-2 flex flex-wrap gap-2">
             {draftTags.map(tag => (
               <span key={tag} className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                 #{tag} <button onClick={() => setDraftTags(draftTags.filter(t => t !== tag))} className="hover:text-red-500"><X size={12}/></button>
               </span>
             ))}
          </div>
        )}

        <div className="mt-2 mb-3">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1"><CalendarClock size={14}/> Recruitment Deadline (Optional)</label>
          <input type="datetime-local" value={draftDeadline} onChange={(e) => setDraftDeadline(e.target.value)} className="w-full rounded-lg border border-slate-200 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"/>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
          <button 
             type="button" 
             onClick={() => {
               const newTags = simulateAITagGeneration(draft, draftTags);
               setDraftTags([...draftTags, ...newTags]);
             }} 
             disabled={!draft.trim()} 
             className="flex items-center gap-1.5 rounded-lg bg-purple-50 px-2 py-1 text-xs font-bold text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
          >
            <BrainCircuit size={14}/> AI Tag
          </button>
          <div className="flex gap-2">
            <button onClick={handleCreatePost} disabled={!draft.trim() || isPosting} className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-50">
              <Send size={14}/> {isPosting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      </div>

      {/* DYNAMIC FEED FILTERS */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button 
           onClick={() => setActiveFilter('All')} 
           className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${activeFilter === 'All' ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}
        >
          All
        </button>
        {userTags.map(tag => (
          <button 
             key={tag}
             onClick={() => setActiveFilter(tag)} 
             className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${activeFilter === tag ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.3)]' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Render Posts */}
      {filteredPosts.length > 0 ? (
        filteredPosts.map(post => (
          <BlueprintPostCard 
            key={post._id} 
            post={post} 
            currentUser={currentUser} 
            onPostDeleted={(id) => setPosts(posts.filter(p => p._id !== id))} 
          />
        ))
      ) : (
        <div className="text-center py-20">
          <AlertCircle size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="font-bold dark:text-white">No posts found</h3>
          <p className="text-sm text-slate-500 mt-2">Try selecting a different filter or search query.</p>
        </div>
      )}
    </div>
  );
}

export default function Dashboard({ activeTab, user }) { 
  const location = useLocation();
  const isProfileRoute = location.pathname.startsWith('/profile/');
  const profileHandle = isProfileRoute ? location.pathname.split('/')[2] : null;
  const isOwnProfile = !profileHandle || profileHandle === user?.handle;

  if (activeTab === 'messages' && !isProfileRoute) return <Messages />;
  if (activeTab === 'profile' || isProfileRoute) return <Profile currentUser={user} isOwnProfile={isOwnProfile} profileHandle={profileHandle} />; 
  return <Home currentUser={user} />; 
}