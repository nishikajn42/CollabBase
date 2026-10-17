/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primaryNavy: '#0D47A1',
        primaryRoyal: '#1976D2',
        secondaryCrimson: '#C62828',
        accentGold: '#F5B041',
        bgWhite: '#FFFFFF',
        bgLight: '#F8F9FA',
      },
      boxShadow: {
        premium: '0 30px 80px rgba(13, 71, 161, 0.12)',
      },
      backgroundImage: {
        gradientHero: 'linear-gradient(135deg, rgba(13,71,161,0.12), rgba(25,118,210,0.06), rgba(255,255,255,0.7))',
      },
    },
  },
  plugins: [],
};
