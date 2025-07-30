/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'slate': {
          300: '#cbd5e1',
          400: '#94a3b8',
          600: '#475569',
          700: '#334155',
        },
        'blue': {
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
        },
        'green': {
          400: '#4ade80',
        },
        'red': {
          500: '#ef4444',
        },
      },
    },
  },
  plugins: [],
}