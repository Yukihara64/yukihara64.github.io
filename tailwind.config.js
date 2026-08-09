/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./admin.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ba-bg': '#0b101d',
        'ba-bg2': '#0d1424',
        'ba-card': 'rgba(15, 23, 42, 0.82)',
        'ba-border': 'rgba(0, 163, 255, 0.35)',
        'ba-pink': '#f36c8b',
        'ba-purple': '#8c7ae6',
        'ba-cyan': '#00a3ff',
        'ba-mint': '#00e8b4',
        'ba-sakura': '#ffb7cc',
        'ba-gold': '#ffb830',
        'ba-text': '#e2f1ff',
        'ba-muted': '#8fa4bf',
      },
      fontFamily: {
        'sans': ['Outfit', 'Nunito', 'Kosugi Maru', 'sans-serif'],
      },
      boxShadow: {
        'glow-pink': '0 0 12px rgba(243, 108, 139, 0.6), 0 0 30px rgba(243, 108, 139, 0.2)',
        'glow-purple': '0 0 12px rgba(140, 122, 230, 0.6), 0 0 30px rgba(140, 122, 230, 0.2)',
        'glow-cyan': '0 0 12px rgba(0, 163, 255, 0.7), 0 0 30px rgba(0, 163, 255, 0.25)',
      }
    },
  },
  plugins: [],
}
