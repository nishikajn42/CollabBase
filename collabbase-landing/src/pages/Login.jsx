import { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { Github, Linkedin, LockKeyhole, Mail, Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';

const socialLinks = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/nishikajn44', Icon: Linkedin },
  { label: 'GitHub', href: 'https://github.com/nishikajn42', Icon: Github },
  { label: 'Email', href: 'mailto:modinishika1542@gmail.com', Icon: Mail },
];

function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" className="h-5 w-5">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" transform="translate(0 4)" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.71 7.18l7.2 5.59c4.2-3.88 6.55-9.58 6.55-17.24Z" />
      <path fill="#FBBC05" d="M10.53 28.59a14.4 14.4 0 0 1-.75-4.59c0-1.6.27-3.14.75-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.88.93 7.55 2.56 10.78l7.97-6.19Z" transform="translate(0 4)" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.9-5.8l-7.2-5.59c-2 1.35-4.57 2.15-8.7 2.15-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z" />
    </svg>
  );
}

const Login = ({ isDarkMode, onToggleTheme, onSignedIn }) => {
  const [error, setError] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  const handleGoogleSuccess = async (tokenResponse) => {
    try {
      // 1. Fetch user details from Google
      const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
      }).then(res => res.json());

      const userEmail = userInfo.email;

      // 2. Restrict access to MITS domains
      if (!userEmail.endsWith('@mitsgwl.ac.in') && !userEmail.endsWith('@mitsgwalior.in')) {
        setError('Access restricted to campus students. Please use your official MITS email.');
        return;
      }

      // 3. SEND DATA TO YOUR BACKEND
      const backendResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/google-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          googleId: userInfo.sub, // Google's unique ID for the user
          email: userInfo.email,
          fullName: userInfo.name,
          profilePicture: userInfo.picture
        })
      });

      const data = await backendResponse.json();

      if (!backendResponse.ok) {
        setError(data.error || 'Failed to connect to database.');
        return;
      }

      // 4. Check profile completion status
      setError('');
      console.log('✅ Successfully saved to MongoDB:', data.user);

      // We add the routing logic (Dashboard vs Onboarding) in the next step!

      if (!data.user.isProfileComplete) {
        // First-time user: redirect to Onboarding to collect GitHub username, Branch, and Year
        onSignedIn('onboarding', data.user); 
      } else {
        // Returning user with complete profile: go straight to Dashboard
        onSignedIn('dashboard', data.user); 
      }
      

    } catch (err) {
      console.error(err);
      setError('Authentication failed. Please try again.');
    }
  };

  const login = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => setError('Google sign-in was cancelled or could not be completed.'),
  });

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f6f8fc] px-5 py-12 text-slate-900 transition-colors duration-300 dark:bg-[#080d18] dark:text-slate-100 sm:px-8">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-[-10rem] h-[26rem] w-[26rem] rounded-full bg-blue-400/20 blur-[100px] dark:bg-blue-500/15" />
        <div className="absolute -right-36 bottom-[-13rem] h-[32rem] w-[32rem] rounded-full bg-violet-400/20 blur-[110px] dark:bg-violet-500/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.68),transparent_68%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(17,30,54,0.48),transparent_68%)]" />
      </div>

      <button
        type="button"
        onClick={onToggleTheme}
        aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
        aria-pressed={isDarkMode}
        className="absolute right-5 top-5 z-10 flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/70 text-slate-600 shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-blue-300 hover:text-blue-600 dark:border-slate-700/70 dark:bg-slate-900/65 dark:text-slate-300 dark:hover:border-blue-400/50 dark:hover:text-blue-300 sm:right-8 sm:top-8"
      >
        {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div className="relative z-[1] flex w-full max-w-[448px] flex-col items-center gap-6">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="w-full rounded-[20px] border border-white/75 bg-white/75 p-8 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.24)] backdrop-blur-2xl dark:border-white/[0.09] dark:bg-slate-900/65 dark:shadow-[0_24px_90px_-32px_rgba(0,0,0,0.75)] sm:p-10"
        >
          <div className="mb-8 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-[18px] border border-blue-200/80 bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-700 shadow-inner shadow-white/90 dark:border-blue-400/20 dark:from-blue-500/15 dark:to-indigo-400/10 dark:text-blue-300 dark:shadow-none">
              <LockKeyhole size={23} strokeWidth={1.8} />
            </div>
          </div>

          <div className="text-center">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-700 dark:text-blue-300">CollabBase · MITS Gwalior</p>
            <h1 className="text-[25px] font-semibold tracking-[-0.04em] text-slate-950 dark:text-white sm:text-[28px]">Sign in to your account</h1>
            <p className="mx-auto mt-3 max-w-[330px] text-sm leading-6 text-slate-600 dark:text-slate-400">
              Sign in with your institute Google account. Access is reserved for the MITS community.
            </p>
          </div>

          <div className="mt-7 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-4 dark:border-slate-700/70 dark:bg-slate-950/35">
            <p className="mb-3 text-xs font-medium text-slate-500 dark:text-slate-400">Supported institute emails</p>
            <div className="flex flex-col gap-3 text-[13px] sm:flex-row sm:items-center sm:justify-between sm:gap-2">
              <p className="text-slate-800 dark:text-slate-200"><span className="font-medium">@mitsgwalior.in</span> <span className="text-slate-500 dark:text-slate-400">Faculty</span></p>
              <span className="hidden h-4 w-px bg-slate-200 dark:bg-slate-700 sm:block" />
              <p className="text-slate-800 dark:text-slate-200"><span className="font-medium">@mitsgwl.ac.in</span> <span className="text-slate-500 dark:text-slate-400">Students</span></p>
            </div>
          </div>

          {error && (
            <motion.p
              role="alert"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-center text-sm text-rose-700 dark:border-rose-400/25 dark:bg-rose-500/10 dark:text-rose-300"
            >
              {error}
            </motion.p>
          )}
          {isVerified && (
            <motion.p
              role="status"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm text-emerald-700 dark:border-emerald-400/25 dark:bg-emerald-500/10 dark:text-emerald-300"
            >
              Institute email verified.
            </motion.p>
          )}

          <motion.button
            type="button"
            onClick={() => {
              setError('');
              setIsVerified(false);
              login();
            }}
            whileHover={{ y: -2, boxShadow: '0 12px 28px rgba(15, 23, 42, 0.14)' }}
            whileTap={{ scale: 0.985 }}
            className="mt-6 flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-[0_4px_12px_rgba(15,23,42,0.06)] transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/20 dark:border-white/10 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
          >
            <GoogleMark />
            Sign in with Google
          </motion.button>

          <p className="mt-5 text-center text-xs leading-5 text-slate-500 dark:text-slate-500">
            Your institute email is only used to verify campus access.
          </p>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="w-full rounded-[18px] border border-white/75 bg-white/55 p-4 shadow-[0_16px_50px_-32px_rgba(15,23,42,0.2)] backdrop-blur-2xl dark:border-white/[0.08] dark:bg-slate-900/45 dark:shadow-[0_18px_60px_-35px_rgba(0,0,0,0.8)] sm:p-6"
        >
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-500">Developed By</p>
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 shrink-0 rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-500 p-[2px] shadow-md shadow-blue-500/15">
              <div aria-label="Nishika Jain profile placeholder" role="img" className="flex h-full w-full items-center justify-center rounded-full border-2 border-white/80 bg-slate-100 text-sm font-semibold tracking-wide text-slate-700 dark:border-slate-900 dark:bg-slate-800 dark:text-slate-200">
                NJ
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-[15px] font-semibold leading-5 text-slate-900 dark:text-white">Nishika Jain</h2>
              <p className="mt-1 text-xs font-medium text-blue-700 dark:text-blue-300">IT(AIR), 2025-2029</p>
              <nav aria-label="Developer social links" className="mt-3 flex items-center gap-2">
                {socialLinks.map(({ label, href, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    target={href.startsWith('mailto:') ? undefined : '_blank'}
                    rel={href.startsWith('mailto:') ? undefined : 'noreferrer'}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200/80 bg-white/65 text-slate-500 transition duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700/70 dark:bg-slate-800/60 dark:text-slate-400 dark:hover:border-blue-400/40 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
                  >
                    <Icon size={15} strokeWidth={1.8} />
                  </a>
                ))}
              </nav>
            </div>
          </div>
        </motion.section>
      </div>
    </main>
  );
};

export default Login;
