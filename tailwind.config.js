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
          DEFAULT: '#1a1a1a',
          light: '#2a2a2a',
          dark: '#0a0a0a',
        },
        secondary: {
          DEFAULT: '#3a3a3a',
          light: '#4a4a4a',
          dark: '#2a2a2a',
        },
        accent: {
          DEFAULT: '#e50914',
          hover: '#f40612',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
