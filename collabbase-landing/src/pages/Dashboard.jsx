import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Edit3, Github, Linkedin, ExternalLink, Activity,
  Send, Plus, Sparkles, MessageCircle, CalendarClock,
  Youtube, Globe, Camera, Image as ImageIcon, Video,
  X, MessageSquareQuote, Search, BrainCircuit, AlertCircle, Cpu, ThumbsUp, MessageSquare, Share2, MoreVertical, Trash2, ArrowLeft, Info,
  Loader2
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

const normalizeTag = (tag) => tag ? tag.toLowerCase().replace(/[^a-z0-9]/g, '') : '';

// 1. POST CARD COMPONENT
// 1. POST CARD COMPONENT
function BlueprintPostCard({ post, currentUser, onPostDeleted }) {
  const authorName = post.author?.fullName || 'User';
  const authorHandle = post.author?.handle || 'user';
  const authorPic = post.author?.profilePicture;
  
  const isAuthor = currentUser?.handle === authorHandle || post.author === currentUser?._id;
  const [shareCount, setShareCount] = useState(post.shareCount || 0);
  const [showOptions, setShowOptions] = useState(false);

  // --- AI ICEBREAKER & REFINEMENT STATES ---
  const [showIcebreakerModal, setShowIcebreakerModal] = useState(false);
  const [icebreakerDraft, setIcebreakerDraft] = useState('');
  const [refineText, setRefineText] = useState('');
  const [isGeneratingIcebreaker, setIsGeneratingIcebreaker] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // --- SUGGESTIONS STATES ---
  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [analyzingMatchFor, setAnalyzingMatchFor] = useState(null);
  const [matchAnalyses, setMatchAnalyses] = useState({});

  const handleOpenIcebreaker = async () => {
    setSelectedCandidate(null);
    setShowIcebreakerModal(true);
    setIsGeneratingIcebreaker(true);
    setIcebreakerDraft('');
    setRefineText('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/messages/generate-icebreaker`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId: currentUser._id, receiverId: post.author._id || post.author, postId: post._id })
      });
      const data = await response.json();
      setIcebreakerDraft(response.ok ? data.draft : "Hi! I'd love to connect regarding your post.");
    } catch (error) {
      setIcebreakerDraft("Hi! I'd love to connect regarding your post.");
    } finally {
      setIsGeneratingIcebreaker(false);
    }
  };

  const handleOpenSuggestionsModal = async () => {
    setShowSuggestionsModal(true);
    setIsLoadingSuggestions(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/messages/suggest-candidates`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post._id, authorId: currentUser._id })
      });
      const data = await res.json();
      setSuggestedUsers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleAnalyzeMatch = async (candidateId) => {
    setAnalyzingMatchFor(candidateId);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/messages/analyze-match`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post._id, candidateId })
      });
      const data = await res.json();
      if (res.ok) setMatchAnalyses(prev => ({ ...prev, [candidateId]: data.matchAnalysis }));
    } catch (e) {
      setMatchAnalyses(prev => ({ ...prev, [candidateId]: "Failed to generate match analysis." }));
    } finally {
      setAnalyzingMatchFor(null);
    }
  };

  const handleOpenReverseIcebreaker = async (candidate) => {
    setSelectedCandidate(candidate);
    setShowIcebreakerModal(true);
    setIsGeneratingIcebreaker(true);
    setIcebreakerDraft('');
    setRefineText('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/messages/generate-author-icebreaker`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorId: currentUser._id, candidateId: candidate._id, postId: post._id })
      });
      const data = await response.json();
      setIcebreakerDraft(response.ok ? data.draft : `Hi ${candidate.fullName}, I think you'd be a great fit!`);
    } catch (error) {
      setIcebreakerDraft(`Hi ${candidate.fullName}, I think you'd be a great fit!`);
    } finally {
      setIsGeneratingIcebreaker(false);
    }
  };

  const handleRefineIcebreaker = async () => {
    if (!refineText.trim() || !icebreakerDraft) return;
    setIsRefining(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/messages/refine-icebreaker`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentDraft: icebreakerDraft, instruction: refineText })
      });
      const data = await response.json();
      if (response.ok) {
        setIcebreakerDraft(data.draft);
        setRefineText('');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsRefining(false);
    }
  };

  const handleSendIcebreaker = async () => {
    if (!icebreakerDraft.trim()) return;
    setIsSendingMessage(true);
    const receiverId = isAuthor && selectedCandidate ? selectedCandidate._id : (post.author._id || post.author);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/messages/send`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId: currentUser._id, receiverId: receiverId, text: icebreakerDraft })
      });
      if (response.ok) {
        alert("Icebreaker sent! Check your Messages tab.");
        setShowIcebreakerModal(false);
        if (isAuthor) setShowSuggestionsModal(false);
      }
    } catch (error) {
      alert("Failed to send message.");
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleShare = async () => {
    const postUrl = `${window.location.origin}/post/${post._id}`;
    navigator.clipboard.writeText(`Check out this post by @${authorHandle}:\n\n${postUrl}`);
    setShareCount(prev => prev + 1);
    alert("Post link copied to clipboard!");
    try { await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${post._id}/share`, { method: 'PUT' }); } catch (e) {}
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${post._id}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) onPostDeleted(post._id);
    } catch (e) {}
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

        {post.media && (
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex justify-center">
            {post.media.startsWith('data:video') ? (
              <video controls src={post.media} className="max-h-[400px] w-full object-contain" />
            ) : (
              <img src={post.media} alt="Post Attachment" className="max-h-[400px] w-full object-contain" />
            )}
          </div>
        )}

        {post.tags && post.tags.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {post.tags.map((tag, idx) => (
              <span key={idx} className={`rounded-full border px-3 py-1 text-xs font-bold shadow-[0_0_8px_rgba(0,0,0,0.1)] backdrop-blur-sm 
                ${idx % 4 === 0 ? 'border-orange-500/50 text-orange-500' : idx % 4 === 1 ? 'border-emerald-500/50 text-emerald-500' : idx % 4 === 2 ? 'border-blue-500/50 text-blue-500' : 'border-purple-500/50 text-purple-500'}`}>
                {tag.startsWith('#') ? tag : `#${tag}`}
              </span>
            ))}
          </div>
        )}

        <div className="mt-5 flex items-center gap-6 border-t border-slate-100 pt-4 text-slate-500 dark:border-slate-800 dark:text-slate-400">
          {/* AI ICEBREAKER BUTTON (For Receivers) */}
          {!isAuthor && (
            <button onClick={handleOpenIcebreaker} className="flex items-center gap-1.5 hover:text-purple-500 text-purple-600 dark:text-purple-400 transition-colors">
               <BrainCircuit size={18} />
               <span className="text-xs font-bold">AI Icebreaker</span>
            </button>
          )}

          {/* FIND TEAMMATES BUTTON (For Authors) */}
          {isAuthor && (
            <button onClick={handleOpenSuggestionsModal} className="flex items-center gap-1.5 hover:text-indigo-500 text-indigo-600 dark:text-indigo-400 transition-colors">
               <BrainCircuit size={18} />
               <span className="text-xs font-bold">Find Teammates</span>
            </button>
          )}
          
          <button onClick={handleShare} className="ml-auto flex items-center gap-2 hover:text-blue-500 transition-colors">
             <Share2 size={20} />
             <span className="text-xs font-semibold">{shareCount} Shares</span>
          </button>
        </div>
      </div>

      {/* SUGGESTIONS MODAL (For Authors) */}
      <AnimatePresence>
        {showSuggestionsModal && (
          <div className="fixed inset-0 z-[140] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800 max-h-[85vh] flex flex-col">
              <div className="flex justify-between p-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <div>
                  <h3 className="font-bold dark:text-white flex items-center gap-2"><Sparkles size={18} className="text-indigo-500"/> Suggested Teammates</h3>
                  <p className="text-xs text-slate-500">Based on overlapping skills and interests.</p>
                </div>
                <button onClick={() => setShowSuggestionsModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
              </div>
              <div className="p-5 overflow-y-auto flex-1 bg-slate-50 dark:bg-[#0b1120]/50">
                {isLoadingSuggestions ? (
                   <div className="flex flex-col items-center justify-center py-10">
                     <Loader2 className="animate-spin text-indigo-500 mb-3" size={32}/>
                     <p className="text-sm font-bold text-slate-600 dark:text-slate-400">Finding matches...</p>
                   </div>
                ) : suggestedUsers.length === 0 ? (
                   <p className="text-center text-sm text-slate-500 py-10">No users found matching these criteria right now.</p>
                ) : (
                   <div className="space-y-4">
                     {suggestedUsers.map(user => (
                       <div key={user._id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                         <div className="flex justify-between items-start">
                           <div className="flex gap-3">
                             {user.profilePicture ? (
                               <img src={user.profilePicture} className="h-12 w-12 rounded-full object-cover"/>
                             ) : (
                               <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold dark:bg-indigo-900/30 dark:text-indigo-400">
                                 {user.fullName?.substring(0,2).toUpperCase()}
                               </div>
                             )}
                             <div>
                               <Link to={`/profile/${user.handle}`} className="font-bold text-sm text-slate-900 dark:text-white hover:underline">{user.fullName}</Link>
                               <p className="text-xs text-slate-500 line-clamp-1">{user.tagline || `@${user.handle}`}</p>
                               <div className="flex flex-wrap gap-1 mt-2">
                                 {(user.skills || []).slice(0, 3).map(skill => (
                                   <span key={skill} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md dark:bg-slate-800 dark:text-slate-400">{skill}</span>
                                 ))}
                                 {user.skills?.length > 3 && <span className="text-[10px] text-slate-400">+{user.skills.length - 3}</span>}
                               </div>
                             </div>
                           </div>
                           <button 
                             onClick={() => handleOpenReverseIcebreaker(user)} 
                             className="shrink-0 flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                           >
                             <Send size={12}/> Pitch Them
                           </button>
                         </div>
                         
                         <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                           {!matchAnalyses[user._id] ? (
                             <button onClick={() => handleAnalyzeMatch(user._id)} disabled={analyzingMatchFor === user._id} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1">
                               {analyzingMatchFor === user._id ? <Loader2 size={12} className="animate-spin"/> : <BrainCircuit size={12}/>}
                               {analyzingMatchFor === user._id ? 'Analyzing match...' : 'Why this person?'}
                             </button>
                           ) : (
                             <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-3 border border-indigo-100 dark:border-indigo-800/50">
                               <p className="text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed font-medium">
                                 <span className="font-bold text-indigo-700 dark:text-indigo-400">AI Match Insight:</span> {matchAnalyses[user._id]}
                               </p>
                             </div>
                           )}
                         </div>
                       </div>
                     ))}
                   </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ICEBREAKER MODAL (Handles both Sender & Author logic + ChatGPT-style Refinement) */}
      <AnimatePresence>
        {showIcebreakerModal && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between p-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="font-bold dark:text-white flex items-center gap-2">
                    <Sparkles size={18} className={isAuthor ? "text-indigo-500" : "text-purple-500"}/> 
                    {isAuthor ? `Draft Pitch to ${selectedCandidate?.fullName}` : 'Draft AI Icebreaker'}
                  </h3>
                </div>
                <button onClick={() => setShowIcebreakerModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
              </div>
              <div className="p-5">
                {isGeneratingIcebreaker ? (
                  <div className="flex flex-col items-center justify-center py-10">
                    <Loader2 className={`animate-spin mb-3 ${isAuthor ? 'text-indigo-500' : 'text-purple-500'}`} size={36}/>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Analyzing Profiles & GitHub...</p>
                  </div>
                ) : (
                  <>
                    <textarea
                      value={icebreakerDraft}
                      onChange={(e) => setIcebreakerDraft(e.target.value)}
                      className="w-full min-h-[140px] rounded-xl border border-slate-200 p-4 text-sm outline-none bg-slate-50 dark:bg-slate-900/50 dark:border-slate-700 dark:text-white resize-none"
                    />
                    
                    {/* ChatGPT Style Refinement Box */}
                    <div className="mt-3 flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 p-1 bg-white dark:bg-slate-900">
                      <input 
                        type="text" 
                        value={refineText}
                        onChange={(e) => setRefineText(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleRefineIcebreaker(); }}
                        placeholder="e.g., Make it shorter, Sound more formal..."
                        className="flex-1 bg-transparent px-3 text-xs outline-none dark:text-white placeholder-slate-400"
                      />
                      <button 
                        onClick={handleRefineIcebreaker} 
                        disabled={!refineText.trim() || isRefining}
                        className="shrink-0 flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50"
                      >
                        {isRefining ? <Loader2 size={12} className="animate-spin"/> : <Sparkles size={12}/>} Refine
                      </button>
                    </div>

                    <div className="mt-5 flex justify-end gap-3">
                      <button onClick={() => setShowIcebreakerModal(false)} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">Cancel</button>
                      <button onClick={handleSendIcebreaker} disabled={!icebreakerDraft.trim() || isSendingMessage} className={`${isAuthor ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-purple-600 hover:bg-purple-700'} text-white px-6 py-2 rounded-xl text-sm font-bold disabled:opacity-50 flex items-center gap-2 shadow-lg`}>
                        {isSendingMessage ? <Loader2 size={16} className="animate-spin"/> : <Send size={16}/>}
                        Send Message
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// 4. MESSAGES (TWO-PANE INBOX) COMPONENT
function Messages({ currentUser }) {
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  // 1. Fetch Directory (Left Pane)
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/messages/conversations/${currentUser._id}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) setConversations(data);
        setIsLoading(false);
      })
      .catch(console.error);
  }, [currentUser._id]);

  // 2. Fetch Chat History (Right Pane) when a conversation is clicked
  useEffect(() => {
    if (activeChat) {
      fetch(`${import.meta.env.VITE_API_URL}/api/messages/${activeChat._id}`)
        .then(res => res.json())
        .then(data => {
          if (!data.error) setMessages(data);
        })
        .catch(console.error);
    }
  }, [activeChat]);

  // 3. Send a new message
  const handleSendMessage = async () => {
    if (!replyText.trim() || !activeChat) return;
    setIsSending(true);

    const receiver = activeChat.participants.find(p => p._id !== currentUser._id);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/messages/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentUser._id,
          receiverId: receiver._id,
          text: replyText
        })
      });

      if (res.ok) {
        const newMsg = await res.json();
        // Optimistically update UI
        setMessages(prev => [...prev, { ...newMsg, sender: currentUser }]);
        setReplyText('');
        
        // Update left pane snippet
        setConversations(prev => prev.map(c => 
          c._id === activeChat._id ? { ...c, lastMessage: newMsg.text } : c
        ));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-purple-500" size={32} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#0b1120] flex h-[75vh]">
      
      {/* LEFT PANE: Directory */}
      <div className="w-1/3 border-r border-slate-200 dark:border-slate-800 flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold dark:text-white">Messages</h2>
        </div>
        
        <div className="overflow-y-auto flex-1">
          {conversations.length === 0 ? (
            <p className="p-6 text-sm text-center text-slate-500">No conversations yet.</p>
          ) : (
            conversations.map(conv => {
              const otherUser = conv.participants.find(p => p._id !== currentUser._id) || conv.participants[0];
              return (
                <button 
                  key={conv._id}
                  onClick={() => setActiveChat(conv)}
                  className={`w-full flex items-center gap-3 p-4 text-left border-b border-slate-100 dark:border-slate-800/50 transition-colors ${activeChat?._id === conv._id ? 'bg-slate-50 dark:bg-slate-800/80' : 'hover:bg-slate-50 dark:hover:bg-slate-900/50'}`}
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-700 font-bold dark:bg-purple-900/30 dark:text-purple-400">
                     {otherUser.profilePicture ? <img src={otherUser.profilePicture} className="h-full w-full rounded-full object-cover"/> : otherUser.fullName?.substring(0,2).toUpperCase()}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{otherUser.fullName}</h4>
                    <p className="text-xs text-slate-500 line-clamp-1">{conv.lastMessage || "Started a conversation"}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT PANE: Contextual Canvas */}
      <div className="w-2/3 flex flex-col bg-slate-50 dark:bg-[#0b1120]">
        {!activeChat ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <MessageCircle size={48} className="text-slate-300 dark:text-slate-700 mb-4" />
            <h3 className="font-bold text-slate-500 dark:text-slate-400">Select a conversation</h3>
            <p className="text-xs text-slate-400 mt-2">Choose an active chat from the left or generate an Icebreaker on someone's post to start networking.</p>
          </div>
        ) : (
          <>
            {/* Header with Context */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center">
              {(() => {
                const receiver = activeChat.participants.find(p => p._id !== currentUser._id) || activeChat.participants[0];
                return (
                  <div className="flex items-center gap-3">
                     <div className="h-10 w-10 shrink-0 rounded-full bg-slate-200 overflow-hidden">
                       {receiver.profilePicture ? <img src={receiver.profilePicture} className="h-full w-full object-cover"/> : <div className="h-full w-full flex items-center justify-center text-slate-500 font-bold">{receiver.fullName.substring(0,2).toUpperCase()}</div>}
                     </div>
                     <div>
                       <Link to={`/profile/${receiver.handle}`} className="font-bold text-sm text-slate-900 dark:text-white hover:underline">{receiver.fullName}</Link>
                       <p className="text-xs text-slate-500">{receiver.tagline || `@${receiver.handle}`}</p>
                     </div>
                  </div>
                );
              })()}
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => {
                const isMe = msg.sender._id === currentUser._id;
                return (
                  <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${isMe ? 'bg-purple-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-white rounded-bl-none'}`}>
                      {msg.text}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
               <div className="flex items-end gap-2">
                 <textarea 
                   value={replyText}
                   onChange={e => setReplyText(e.target.value)}
                   onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                   placeholder="Write a message..."
                   className="flex-1 resize-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm outline-none dark:text-white max-h-32"
                   rows={1}
                 />
                 <button 
                   onClick={handleSendMessage}
                   disabled={!replyText.trim() || isSending}
                   className="h-11 w-11 shrink-0 flex items-center justify-center rounded-xl bg-purple-600 text-white disabled:opacity-50 hover:bg-purple-700 transition-colors"
                 >
                   {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} className="-ml-1" />}
                 </button>
               </div>
            </div>
          </>
        )}
      </div>
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
  const [isLoadingPosts, setIsLoadingPosts] = useState(true); 
  
  const [draft, setDraft] = useState(''); 
  const [draftTags, setDraftTags] = useState([]); 
  const [draftDeadline, setDraftDeadline] = useState('');
  const [postMedia, setPostMedia] = useState(null); 
  const [isPosting, setIsPosting] = useState(false); 
  const [manualTag, setManualTag] = useState('');
  const [isAILoading, setIsAILoading] = useState(false); // REAL AI LOADER STATE

  const [editForm, setEditForm] = useState({ tagline: '', about: '', newLinkTitle: '', newLinkUrl: '', githubUsername: '', newSkill: '', newInterest: '' });
  
  const [feedbackDraft, setFeedbackDraft] = useState('');
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);

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
      
      setIsLoadingPosts(true); 
      const token = localStorage.getItem('token'); 
      
      fetch(`${import.meta.env.VITE_API_URL}/api/posts`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {} 
      })
        .then(res => res.json())
        .then(data => {
          if(!data.error) {
            const postsArray = Array.isArray(data) ? data : (data.posts || []); 
            setUserPosts(postsArray.filter(p => p.author?.handle === userData.handle || p.author?._id === userData._id || p.author === userData._id));
          } 
        })
        .catch(console.error)
        .finally(() => setIsLoadingPosts(false)); 
    }
  }, [userData]);

  useEffect(() => {
    if (userData?.githubUsername) {
      if (userData.githubAnalysisCache) {
        setGithubData(userData.githubAnalysisCache);
      } else {
        setGhLoading(true);
        fetch(`${import.meta.env.VITE_API_URL}/api/github/analyze/${userData.githubUsername}`)
          .then(res => res.json())
          .then(data => {
            if (!data.error) {
              setGithubData(data);
              if (isOwnProfile) handleSaveProfile({ githubAnalysisCache: data });
            }
            setGhLoading(false);
          }).catch(() => setGhLoading(false));
      }
    }
  }, [userData?.githubUsername, isOwnProfile]);

  const handleSaveProfile = async (updates) => {
    if (!isOwnProfile) return;
    const oldData = { ...userData };
    const newUserData = { ...userData, ...updates };
    setUserData(newUserData); 
    updateUser(updates); 
    setActiveModal(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/update-profile`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: userData._id, ...updates })
      });
      if (!res.ok) throw new Error("DB Error");
    } catch (error) { 
      setUserData(oldData);
      updateUser(oldData);
    }
  };

  const handleRemoveItem = (field, itemToRemove) => {
    if (field === 'links') handleSaveProfile({ links: userData.links.filter(link => link.title !== itemToRemove.title) });
    else handleSaveProfile({ [field]: userData[field].filter(item => item !== itemToRemove) });
  };

  // REAL AI TAG GENERATOR FUNCTION
  const handleAITagClick = async () => {
    if (!draft.trim() && !postMedia) return;
    setIsAILoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/analyze-media`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ text: draft, imageBase64: postMedia })
      });

      const data = await response.json();
      
      if (data.tags && Array.isArray(data.tags)) {
        const combinedTags = [...draftTags, ...data.tags];
        const uniqueTags = combinedTags.filter((val, idx, arr) => 
          arr.findIndex(t => t.toLowerCase() === val.toLowerCase()) === idx
        );
        setDraftTags(uniqueTags);
      } else {
        alert("AI could not generate tags for this content.");
      }
    } catch (error) {
      console.error("AI Tag generation failed:", error);
      alert("Failed to connect to AI server.");
    } finally {
      setIsAILoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!draft.trim() && !postMedia) return;
    if (isPosting) return;
    setIsPosting(true);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ content: draft, tags: draftTags, deadline: draftDeadline || null, media: postMedia })
      });
      if (response.ok) {
        const newPost = await response.json();
        newPost.author = userData; 
        setUserPosts(prev => [newPost, ...prev]);
        setDraft(''); setDraftTags([]); setDraftDeadline(''); setPostMedia(null); setActiveModal(null);
      }
    } catch (error) { console.error('Error posting:', error); } finally { setIsPosting(false); }
  };

  const handleManualTagAdd = (e) => {
    if (e.key === 'Enter' && manualTag.trim()) {
      e.preventDefault();
      const cleanTag = manualTag.trim().replace(/^#/, '');
      if (!draftTags.map(normalizeTag).includes(normalizeTag(cleanTag))) {
        setDraftTags([...draftTags, cleanTag]);
      }
      setManualTag('');
    }
  };

  const handleGiveFeedback = async () => {
    if (!feedbackDraft.trim() || isSendingFeedback) return;
    setIsSendingFeedback(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/add-feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ fromUserId: currentUser._id, toHandle: profileHandle, feedbackText: feedbackDraft })
      });
      if (res.ok) {
        const newFeedbackStr = `From @${currentUser.handle}: ${feedbackDraft}`;
        setUserData({...userData, receivedFeedbacks: [...(userData.receivedFeedbacks||[]), newFeedbackStr]});
        setActiveModal(null);
        setFeedbackDraft('');
        alert("Feedback posted successfully!");
      }
    } catch (e) {
      alert("Failed to send feedback");
    } finally {
      setIsSendingFeedback(false);
    }
  };

  const handleDeleteFeedback = async (feedbackText) => {
    if (!window.confirm("Delete this feedback?")) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/delete-feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ userId: currentUser._id, feedbackText })
      });
      if (res.ok) {
        const updatedList = userData.givenFeedbacks.filter(f => f !== feedbackText);
        setUserData({...userData, givenFeedbacks: updatedList});
        updateUser({ givenFeedbacks: updatedList });
      }
    } catch (e) { console.error("Delete failed", e); }
  };

  if (isLoadingUser) return <div className="py-20 text-center">Loading...</div>;
  if (userNotFound || !userData) return <div className="py-20 text-center font-bold">User not found</div>;

  const cleanName = (userData.fullName || 'User Name').replace(userData.enrollmentNo || '', '').trim(); 
  const initials = cleanName.substring(0, 2).toUpperCase();

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      
      {!isOwnProfile && (
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors">
          <ArrowLeft size={16} /> Back to Feed
        </Link>
      )}

      {/* HEADER */}
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

      {/* AREA OF INTEREST */}
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

      {/* GITHUB CYBERPUNK BOX */}
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
            
            {githubData.publicRepos === 0 ? (
               <div className="bg-white/5 border border-amber-500/30 p-6 rounded-2xl text-center backdrop-blur-md">
                 <h4 className="text-amber-400 font-bold mb-2">Active Learner / Building Phase 🏗️</h4>
                 <p className="text-xs text-slate-400">Currently bootstrapping new projects in private repositories or local environments.</p>
               </div>
            ) : (
              <>
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
              </>
            )}
          </div>
        ) : (
          <div className="text-center py-6 relative z-10">
            <Github size={32} className="mx-auto mb-3 text-slate-500" />
            <h3 className="font-bold text-lg mb-1">{!userData?.githubUsername ? "GitHub Not Linked" : "Analysis Required"}</h3>
            <p className="text-xs text-slate-400 mb-4">Link your GitHub to generate an AI-powered developer card.</p>
            {isOwnProfile && <button onClick={() => setActiveModal('edit-profile')} className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-colors">Update GitHub Username</button>}
          </div>
        )}
      </div>

      {/* CONNECT & PORTFOLIO */}
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

      {/* FEEDBACK RECEIVED & GIVING */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#0b1120] sm:p-8">
        <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold dark:text-white"><MessageSquareQuote size={18} className="text-green-500" /> Feedback Received</h2>
            {!isOwnProfile && (
                <button onClick={() => setActiveModal('give-feedback')} className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400"><Plus size={14}/> Give Feedback</button>
            )}
        </div>
        {(!userData.receivedFeedbacks || userData.receivedFeedbacks.length === 0) ? (
          <p className="text-sm italic text-slate-500">No feedback received yet.</p>
        ) : (
          <div className="space-y-3">
            {userData.receivedFeedbacks.map((fb, i) => (
               <div key={i} className="rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-900/50 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
                 "{fb}"
               </div>
            ))}
          </div>
        )}
      </div>

      {/* ABOUT */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#0b1120] sm:p-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold dark:text-white"><Info size={18} className="text-blue-500" /> About</h2>
          {isOwnProfile && <button onClick={() => setActiveModal('edit-about')} className="text-slate-400 hover:text-blue-500"><Edit3 size={18} /></button>}
        </div>
        <p className="text-sm whitespace-pre-line text-slate-700 dark:text-slate-300">
          {userData.about || <span className="italic text-slate-500">No about added yet.</span>}
        </p>
      </div>

      {/* POSTS WITH LOADING STATE */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#0b1120] sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold dark:text-white">Activity & Posts</h2>
          {isOwnProfile && (
            <button onClick={() => setActiveModal('create-post')} className="rounded-full border border-blue-600 px-4 py-1.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20">
              Create a post
            </button>
          )}
        </div>

        {isLoadingPosts ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 py-12 dark:border-slate-700">
            <Loader2 className="animate-spin text-blue-500 mb-2" size={32} />
            <p className="text-sm font-bold text-slate-500">Loading posts...</p>
          </div>
        ) : userPosts.length > 0 ? (
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

      {/* SKILLS */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#0b1120] sm:p-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold dark:text-white"><Cpu size={18} className="text-indigo-500" /> Skills & Tech Stack</h2>
          {isOwnProfile && <button onClick={() => setActiveModal('edit-skills')} className="text-slate-400 hover:text-indigo-500"><Edit3 size={18} /></button>}
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

      {/* GIVEN FEEDBACK SECTION */}
      {isOwnProfile && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#0b1120] sm:p-8">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold dark:text-white"><ThumbsUp size={18} className="text-blue-500" /> Feedback Given</h2>
            {(!userData.givenFeedbacks || userData.givenFeedbacks.length === 0) ? (
              <p className="text-sm italic text-slate-500">No feedback given yet.</p>
            ) : (
              <div className="space-y-3">
                {userData.givenFeedbacks.map((fb, i) => (
                   <div key={i} className="flex justify-between items-center rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-900/50 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
                      <span>"{fb}"</span>
                      <button onClick={() => handleDeleteFeedback(fb)} className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition"><Trash2 size={16}/></button>
                   </div>
                ))}
              </div>
            )}
          </div>
      )}

      {/* MODALS */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between p-4 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
                <h3 className="font-bold dark:text-white capitalize">{activeModal.replace('-', ' ')}</h3>
                <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
              </div>
              
              <div className="p-4 space-y-4">
                
                {activeModal === 'give-feedback' && (
                    <div className="space-y-3">
                        <p className="text-sm text-slate-500">Write constructive feedback for @{profileHandle}</p>
                        <textarea 
                            autoFocus rows={4} value={feedbackDraft} 
                            onChange={(e) => setFeedbackDraft(e.target.value)} 
                            placeholder="Great working with them on..." 
                            className="w-full rounded-xl border border-slate-200 p-3 text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                        />
                        <button onClick={handleGiveFeedback} disabled={!feedbackDraft.trim() || isSendingFeedback} className="w-full bg-green-600 text-white font-bold py-2.5 rounded-xl disabled:opacity-50">
                            {isSendingFeedback ? 'Sending...' : 'Post Feedback'}
                        </button>
                    </div>
                )}

                {activeModal === 'create-post' && (
                   <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:bg-[#0b1120] dark:border-slate-800">
                     <textarea 
                        autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} 
                        placeholder="Need a teammate? Describe your project..." 
                        className="min-h-[100px] w-full resize-none bg-transparent text-sm outline-none dark:text-white" 
                     />
                     
                     {postMedia && (
                        <div className="relative mb-3 inline-block rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                           {postMedia.startsWith('data:video') ? (
                             <video src={postMedia} className="h-32 object-cover" />
                           ) : (
                             <img src={postMedia} alt="Upload preview" className="h-32 object-cover" />
                           )}
                           <button onClick={() => setPostMedia(null)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-red-500"><X size={14}/></button>
                        </div>
                     )}

                     <div className="my-2 flex flex-wrap gap-2 items-center">
                        {draftTags.map(tag => (
                          <span key={tag} className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                            #{tag} <button onClick={() => setDraftTags(draftTags.filter(t => t !== tag))} className="hover:text-red-500"><X size={12}/></button>
                          </span>
                        ))}
                        <input 
                           type="text" value={manualTag} onChange={e => setManualTag(e.target.value)} onKeyDown={handleManualTagAdd} 
                           placeholder={draftTags.length === 0 ? "Type custom tag & press Enter..." : "+ custom tag"} 
                           className="bg-transparent text-xs outline-none text-slate-500 flex-1 min-w-[150px]"
                        />
                     </div>
                     <div className="mt-2 mb-3">
                       <label className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1"><CalendarClock size={14}/> Recruitment Deadline</label>
                       <input type="datetime-local" value={draftDeadline} onChange={(e) => setDraftDeadline(e.target.value)} className="w-full rounded-lg border border-slate-200 p-2 text-xs dark:bg-slate-800 dark:text-white"/>
                     </div>
                     
                     <div className="mt-3 flex justify-between items-center border-t border-slate-200/50 pt-3">
                       <div className="flex gap-3 items-center">
                         <label className="cursor-pointer text-slate-400 hover:text-blue-500 transition" title="Add Image">
                            <ImageIcon size={18} />
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                               const f = e.target.files[0];
                               if(f) { const r = new FileReader(); r.onloadend = () => setPostMedia(r.result); r.readAsDataURL(f); }
                            }}/>
                         </label>
                         <label className="cursor-pointer text-slate-400 hover:text-blue-500 transition" title="Add Video">
                            <Video size={18} />
                            <input type="file" accept="video/*" className="hidden" onChange={(e) => {
                               const f = e.target.files[0];
                               if(f) { const r = new FileReader(); r.onloadend = () => setPostMedia(r.result); r.readAsDataURL(f); }
                            }}/>
                         </label>

                         {/* REAL AI TAG BUTTON */}
                         <button 
                           type="button" 
                           onClick={handleAITagClick} 
                           disabled={(!draft.trim() && !postMedia) || isAILoading} 
                           className="flex items-center gap-1.5 rounded-lg bg-purple-50 px-2 py-1 text-xs font-bold text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 ml-2 hover:bg-purple-100 transition-colors"
                         >
                           {isAILoading ? <Loader2 size={14} className="animate-spin" /> : <BrainCircuit size={14}/>}
                           {isAILoading ? 'Analyzing...' : 'AI Tag'}
                         </button>
                       </div>
                       
                       <button onClick={handleCreatePost} disabled={(!draft.trim() && !postMedia) || isPosting} className="flex items-center gap-1.5 bg-blue-600 text-white px-5 py-2 rounded-xl text-xs font-bold disabled:opacity-50"><Send size={14}/> Post</button>
                     </div>
                   </div>
                )}
                
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
              
              {isOwnProfile && !['create-post', 'give-feedback'].includes(activeModal) && (
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
  const navigate = useNavigate();
  const [draft, setDraft] = useState('');
  const [draftTags, setDraftTags] = useState([]);
  const [draftDeadline, setDraftDeadline] = useState('');
  const [postMedia, setPostMedia] = useState(null); 
  const [manualTag, setManualTag] = useState('');
  const [isAILoading, setIsAILoading] = useState(false); // REAL AI LOADER STATE
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState(''); 
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  
  const [posts, setPosts] = useState([]); 
  const [isLoadingPosts, setIsLoadingPosts] = useState(true); 
  const [isPosting, setIsPosting] = useState(false);
  
  const [activeFilters, setActiveFilters] = useState([]);

  useEffect(() => {
    setIsLoadingPosts(true); 
    const token = localStorage.getItem('token'); 
    
    fetch(`${import.meta.env.VITE_API_URL}/api/posts`, {
       headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(data => {
         if(!data.error) {
            const postsArray = Array.isArray(data) ? data : (data.posts || []); 
            setPosts(postsArray); 
         } 
      })
      .catch(console.error)
      .finally(() => setIsLoadingPosts(false)); 
  }, []);

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
    const searchToUse = activeSearch || searchQuery;
    const contentToSearch = (post.content || '').toLowerCase();
    const tagsToSearch = (post.tags || []).join(' ').toLowerCase();
    const fullText = `${contentToSearch} ${tagsToSearch}`;
    const matchesSearch = searchToUse ? fullText.includes(searchToUse.toLowerCase().replace('#', '')) : true;
    
    let matchesFilter = true;
    if (activeFilters.length > 0) {
      const normalizedPostTags = (post.tags || []).map(normalizeTag);
      matchesFilter = activeFilters.some(filterTag => normalizedPostTags.includes(normalizeTag(filterTag)));
    }
    return matchesSearch && matchesFilter;
  });

  const toggleFilter = (tag) => {
    if (activeFilters.includes(tag)) {
      setActiveFilters(activeFilters.filter(t => t !== tag));
    } else {
      setActiveFilters([...activeFilters, tag]);
    }
  };

  // REAL AI TAG GENERATOR FUNCTION
  const handleAITagClick = async () => {
    if (!draft.trim() && !postMedia) return;
    setIsAILoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/analyze-media`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ text: draft, imageBase64: postMedia })
      });

      const data = await response.json();
      
      if (data.tags && Array.isArray(data.tags)) {
        const combinedTags = [...draftTags, ...data.tags];
        const uniqueTags = combinedTags.filter((val, idx, arr) => 
          arr.findIndex(t => t.toLowerCase() === val.toLowerCase()) === idx
        );
        setDraftTags(uniqueTags);
      } else {
        alert("AI could not generate tags for this content.");
      }
    } catch (error) {
      console.error("AI Tag generation failed:", error);
      alert("Failed to connect to AI server.");
    } finally {
      setIsAILoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!draft.trim() && !postMedia) return;
    if (isPosting) return;
    setIsPosting(true);
    const token = localStorage.getItem('token');
  
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ content: draft, tags: draftTags, deadline: draftDeadline || null, media: postMedia }) 
      });
  
      if (response.ok) {
        const newPost = await response.json();
        newPost.author = currentUser; 
        setPosts(prev => [newPost, ...prev]);
        setDraft(''); setDraftTags([]); setDraftDeadline(''); setPostMedia(null);
      }
    } catch (error) { console.error('Error posting:', error); } finally { setIsPosting(false); }
  };

  const handleManualTagAdd = (e) => {
    if (e.key === 'Enter' && manualTag.trim()) {
      e.preventDefault();
      const cleanTag = manualTag.trim().replace(/^#/, '');
      if (!draftTags.map(normalizeTag).includes(normalizeTag(cleanTag))) {
        setDraftTags([...draftTags, cleanTag]);
      }
      setManualTag('');
    }
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
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                setActiveSearch(searchQuery);
                setShowSearchDropdown(false);
              }
            }}
            onFocus={() => { if (searchQuery.length > 1) setShowSearchDropdown(true) }}
            onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
            className="w-full bg-transparent text-sm outline-none dark:text-white" 
          />
          {searchQuery && (
            <button 
              onClick={() => { setSearchQuery(''); setActiveSearch(''); setShowSearchDropdown(false); }} 
              className="mr-2 text-xs font-bold text-slate-400"
            >
              Clear
            </button>
          )}
        </div>

        {showSearchDropdown && searchQuery && (
          <div className="absolute top-14 left-0 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
             {searchResults.length > 0 ? (
               searchResults.map(user => (
                 <button 
                    key={user.handle} 
                    onMouseDown={() => navigate(`/profile/${user.handle}`)} 
                    className="w-full flex items-center gap-3 border-b border-slate-100 p-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 text-left transition-colors"
                 >
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
                 </button>
               ))
             ) : (
               <div className="p-4 text-center text-sm text-slate-500">Press enter to filter posts for "{searchQuery}"</div>
             )}
          </div>
        )}
      </div>

      {/* Active Search Banner */}
      {activeSearch && (
         <div className="flex items-center justify-between rounded-xl bg-blue-50 border border-blue-100 p-4 dark:bg-blue-900/20 dark:border-blue-800/50">
            <div className="flex items-center gap-2">
               <Search size={18} className="text-blue-500" />
               <span className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                 Showing results for <span className="font-bold text-blue-600 dark:text-blue-400">"{activeSearch}"</span>
               </span>
            </div>
            <button 
              onClick={() => { setActiveSearch(''); setSearchQuery(''); }} 
              className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
               <ArrowLeft size={14}/> Back to Feed
            </button>
         </div>
      )}

      {/* CREATE POST BOX IN FEED */}
      {!activeSearch && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#0b1120]">
          <textarea 
            value={draft} onChange={(e) => setDraft(e.target.value)} 
            placeholder="Need a teammate? Describe your project..." 
            className="min-h-[100px] w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white" 
          />
          
          {postMedia && (
             <div className="relative mb-3 inline-block rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                {postMedia.startsWith('data:video') ? (
                  <video src={postMedia} className="h-32 object-cover" />
                ) : (
                  <img src={postMedia} alt="Upload preview" className="h-32 object-cover" />
                )}
                <button onClick={() => setPostMedia(null)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-red-500"><X size={14}/></button>
             </div>
          )}

          <div className="my-2 flex flex-wrap gap-2 items-center">
             {draftTags.map(tag => (
               <span key={tag} className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                 #{tag} <button onClick={() => setDraftTags(draftTags.filter(t => t !== tag))} className="hover:text-red-500"><X size={12}/></button>
               </span>
             ))}
             <input 
                type="text" 
                value={manualTag} 
                onChange={e => setManualTag(e.target.value)} 
                onKeyDown={handleManualTagAdd} 
                placeholder={draftTags.length === 0 ? "Type custom tag & press Enter..." : "+ custom tag"} 
                className="bg-transparent text-xs outline-none text-slate-500 dark:text-slate-400 placeholder-slate-400 flex-1 min-w-[150px]"
             />
          </div>

          <div className="mt-2 mb-3">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1"><CalendarClock size={14}/> Recruitment Deadline (Optional)</label>
            <input type="datetime-local" value={draftDeadline} onChange={(e) => setDraftDeadline(e.target.value)} className="w-full rounded-lg border border-slate-200 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"/>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
            <div className="flex gap-3 items-center">
               <label className="cursor-pointer text-slate-400 hover:text-blue-500 transition" title="Add Image">
                  <ImageIcon size={18} />
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                     const f = e.target.files[0];
                     if(f) { const r = new FileReader(); r.onloadend = () => setPostMedia(r.result); r.readAsDataURL(f); }
                  }}/>
               </label>
               <label className="cursor-pointer text-slate-400 hover:text-blue-500 transition" title="Add Video">
                  <Video size={18} />
                  <input type="file" accept="video/*" className="hidden" onChange={(e) => {
                     const f = e.target.files[0];
                     if(f) { const r = new FileReader(); r.onloadend = () => setPostMedia(r.result); r.readAsDataURL(f); }
                  }}/>
               </label>

               {/* REAL AI TAG BUTTON */}
               <button 
                 type="button" 
                 onClick={handleAITagClick} 
                 disabled={(!draft.trim() && !postMedia) || isAILoading} 
                 className="flex items-center gap-1.5 rounded-lg bg-purple-50 px-2 py-1 text-xs font-bold text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 ml-2 hover:bg-purple-100 transition-colors"
               >
                 {isAILoading ? <Loader2 size={14} className="animate-spin" /> : <BrainCircuit size={14}/>}
                 {isAILoading ? 'Analyzing...' : 'AI Tag'}
               </button>
            </div>
            
            <button onClick={handleCreatePost} disabled={(!draft.trim() && !postMedia) || isPosting} className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-50">
              <Send size={14}/> {isPosting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      )}

      {/* MULTI-SELECT DYNAMIC FEED FILTERS */}
      {!activeSearch && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button 
             onClick={() => setActiveFilters([])} 
             className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${activeFilters.length === 0 ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}
          >
            All
          </button>
          {userTags.map(tag => (
            <button 
               key={tag}
               onClick={() => toggleFilter(tag)} 
               className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${activeFilters.includes(tag) ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.3)]' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}
            >
               {tag}
            </button>
          ))}
        </div>
      )}

      {/* Render Posts (With Loader) */}
      {isLoadingPosts ? (
        <div className="flex flex-col items-center justify-center py-20">
           <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
           <h3 className="font-bold text-slate-700 dark:text-slate-300">Loading your feed...</h3>
           <p className="text-xs text-slate-500 mt-1">Fetching latest posts.</p>
        </div>
      ) : filteredPosts.length > 0 ? (
        filteredPosts.map(post => (
          <BlueprintPostCard 
            key={post._id} 
            post={post} 
            currentUser={currentUser} 
            onPostDeleted={(id) => setPosts(posts.filter(p => p._id !== id))} 
          />
        ))
      ) : (
        <div className="text-center py-20 bg-white dark:bg-[#0b1120] rounded-2xl border border-slate-200 dark:border-slate-800">
          <AlertCircle size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="font-bold dark:text-white">
            {activeSearch ? `No posts found for "${activeSearch}"` : 'No posts found'}
          </h3>
          <p className="text-sm text-slate-500 mt-2 mb-4">
            {activeSearch ? 'Try searching for a different tag or keyword.' : 'Be the first to post something!'}
          </p>
          {activeSearch && (
             <button 
               onClick={() => { setActiveSearch(''); setSearchQuery(''); }} 
               className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-lg hover:bg-blue-700"
             >
               Clear Search & Go Back
             </button>
          )}
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

  // if (activeTab === 'messages' && !isProfileRoute) return <Messages />;
  if (activeTab === 'messages' && !isProfileRoute) return <Messages currentUser={user} />;
  if (activeTab === 'profile' || isProfileRoute) return <Profile currentUser={user} isOwnProfile={isOwnProfile} profileHandle={profileHandle} />; 
  return <Home currentUser={user} />; 
}