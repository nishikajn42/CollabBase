import React from 'react';
import { Edit3, MapPin, Github, Linkedin, ExternalLink, Activity } from 'lucide-react';

const Profile = ({ user }) => {
  // Safe fallbacks
  const fullName = user?.fullName || 'Nishika Jain';
  const tagline = user?.tagline || 'Learning & Building Projects | Frontend Developer';
  const branch = user?.branch || 'Information Technology with AI & Robotics';
  const github = user?.githubUsername || 'nishikajn42';
  const linkedin = user?.linkedinUrl || 'www.linkedin.com/in/nishikajn44'; // Using your real data
  
  // Default Virtual Avatar Generation
  const initials = fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      
      {/* 1. Header Card (Cover & Avatar) */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800/80 dark:bg-[#0b1120]">
        
        {/* Cover Photo */}
        <div className="h-32 w-full bg-slate-200 dark:bg-slate-800 sm:h-48">
           {/* You can add an img tag here later when users upload covers */}
        </div>

        {/* Profile Info Section */}
        <div className="relative px-6 pb-6 pt-16 sm:px-8 sm:pt-20">
          
          {/* Virtual Avatar positioned over the cover photo */}
          <div className="absolute -top-16 left-6 flex h-28 w-28 items-center justify-center rounded-full border-4 border-white bg-blue-600 text-3xl font-bold text-white shadow-md dark:border-[#0b1120] sm:-top-20 sm:left-8 sm:h-36 sm:w-36 sm:text-5xl">
            {initials}
          </div>

          {/* Edit Button */}
          <button className="absolute right-6 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
            <Edit3 size={16} />
          </button>

          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{fullName}</h1>
              <p className="mt-1 max-w-lg text-sm text-slate-800 dark:text-slate-200">{tagline}</p>
              
              <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <MapPin size={14} />
                <span>Madhya Pradesh, India</span>
                <span className="mx-1">•</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">Contact info</span>
              </div>
            </div>

            {/* Institute Mini-Badge */}
            <div className="mt-4 flex items-center gap-3 sm:mt-0 sm:max-w-[200px]">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-slate-800">
                <GraduationCap size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-xs font-semibold leading-tight text-slate-700 dark:text-slate-300">
                Madhav Institute of Technology and Science, Gwalior
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* 2. About Section */}
      <div className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-[#0b1120] sm:p-8">
        <button className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
          <Edit3 size={18} />
        </button>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">About</h2>
        <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          I am a B.Tech student in {branch} at MITS Gwalior. I am currently building a solid foundation in Data Structures & Algorithms, along with the MERN Stack.
          <br /><br />
          I am eager to explore learning opportunities, mentorship, and collaborations that help me grow as a developer.
        </p>
      </div>

      {/* 3. Social Media & Proof of Work */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-[#0b1120] sm:p-8">
        <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Connect & Portfolio</h2>
        <div className="flex flex-wrap gap-3">
          
          {/* GitHub - Conditionally Rendered */}
          {github && (
            <a href={`https://github.com/${github}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
              <Github size={18} />
              GitHub
              <ExternalLink size={14} className="ml-1 text-slate-400" />
            </a>
          )}

          {/* LinkedIn - Conditionally Rendered */}
          {linkedin && (
            <a href={`https://${linkedin}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
              <Linkedin size={18} className="text-[#0A66C2]" />
              LinkedIn
              <ExternalLink size={14} className="ml-1 text-slate-400" />
            </a>
          )}

        </div>
      </div>

      {/* 4. Activity / Posts (Empty State) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-[#0b1120] sm:p-8">
        <h2 className="mb-6 text-lg font-bold text-slate-900 dark:text-white">Activity</h2>
        
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 py-12 dark:border-slate-700">
          <div className="mb-3 rounded-full bg-slate-100 p-3 dark:bg-slate-800">
            <Activity size={24} className="text-slate-400" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">No posts yet</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Posts you create will appear here.</p>
          
          <button className="mt-4 rounded-full border border-blue-600 px-4 py-1.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20">
            Create a post
          </button>
        </div>
      </div>

    </div>
  );
};

// Dummy icon component since GraduationCap might not import cleanly depending on lucide version
const GraduationCap = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);

export default Profile;