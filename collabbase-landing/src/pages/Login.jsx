import { ArrowRight, Github, GraduationCap, LockKeyhole, Network, Sparkles } from 'lucide-react';
import { demoUsers } from '../data/seedData';
import { useAuth } from '../context/AuthContext';

export default function Login({ onSignedIn }) {
  const { signIn } = useAuth();
  const handleSignIn = async (userId) => {
    await signIn({ userId });
    onSignedIn?.();
  };

  return (
    <main className="login-screen">
      <div className="login-campus" />
      <div className="login-wash" />
      <section className="login-card">
        <div className="brand-lockup"><span className="brand-mark"><Network size={20} /></span><span>CollabBase</span><span className="brand-campus">MITS</span></div>
        <div className="login-intro"><div className="eyebrow"><Sparkles size={13} /> MITS talent network</div><h1>Find the people who make good ideas real.</h1><p>Sign in with your college identity to discover projects, teammates, and proof of work.</p></div>
        <button className="campus-login" onClick={() => handleSignIn(demoUsers[0].id)}><GraduationCap size={19} /> Continue with MITS email <ArrowRight size={17} /></button>
        <div className="or-divider"><span>demo environment</span></div>
        <div className="demo-note"><LockKeyhole size={16} /><span>Quick-switch profiles below are preloaded for your presentation.</span></div>
        <div className="profile-switcher"><div className="switcher-label">Select Demo Profile <span>4 journeys</span></div><div className="profile-grid">{demoUsers.map((user) => <button key={user.id} className="profile-choice" onClick={() => handleSignIn(user.id)}><span className="avatar" style={{ background: user.avatarColor }}>{user.initials}</span><span className="profile-copy"><strong>{user.shortName}</strong><small>{user.role}</small></span><Github size={15} /></button>)}</div></div>
      </section>
      <p className="login-footnote">Built for MITS students <span>•</span> Verified by work, strengthened by peers</p>
    </main>
  );
}