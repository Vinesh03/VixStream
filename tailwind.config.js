/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#101014',
          light: '#1a1a21',
          dark: '#08080b',
        },
        secondary: {
          DEFAULT: '#26262f',
          light: '#34343f',
          dark: '#1c1c24',
        },
        accent: {
          DEFAULT: '#ff3848',
          hover: '#ff5a67',
          soft: '#2e1418',
        },
        surface: {
          DEFAULT: '#16161c',
          variant: '#20202a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        // Material 3 Expressive: forme molto morbide
        'm3': '28px',
        'm3-lg': '36px',
        'card': '20px',
      },
      boxShadow: {
        'card': '0 4px 24px -6px rgba(0,0,0,.55)',
        'card-hover': '0 12px 40px -8px rgba(255,56,72,.25)',
        'glow': '0 0 32px rgba(255,56,72,.35)',
      },
      keyframes: {
        'page-in': {
          from: { opacity: '0', transform: 'translateY(14px) scale(.99)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(.92)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'shimmer': {
          from: { backgroundPosition: '-400px 0' },
          to: { backgroundPosition: '400px 0' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '.55' },
        },
      },
      animation: {
        'page-in': 'page-in .35s cubic-bezier(.2,.8,.2,1) both',
        'fade-in': 'fade-in .3s ease both',
        'scale-in': 'scale-in .25s cubic-bezier(.2,.8,.2,1) both',
        'slide-up': 'slide-up .45s cubic-bezier(.2,.8,.2,1) both',
        'shimmer': 'shimmer 1.6s linear infinite',
        'pulse-soft': 'pulse-soft 1.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
