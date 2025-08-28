import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Custom dark theme colors
        dark: {
          bg: '#0f172a',      // slate-900
          'bg-secondary': '#1e293b', // slate-800
          'bg-tertiary': '#334155',  // slate-700
          text: '#f8fafc',    // slate-50
          'text-secondary': '#cbd5e1', // slate-300
          'text-muted': '#94a3b8',     // slate-400
          border: '#334155',   // slate-700
          'border-light': '#475569', // slate-600
        },
        // Enhanced blue colors for dark mode
        'blue-dark': {
          50: '#1e40af',
          100: '#1d4ed8',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        }
      },
      animation: {
        'fadeIn': 'fadeIn 0.3s ease-out',
        'shine': 'shine 0.8s ease-out',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': {
            opacity: '0',
            transform: 'translateY(-10px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        shine: {
          '0%': {
            transform: 'translateX(-100%) skewX(-15deg)',
          },
          '100%': {
            transform: 'translateX(200%) skewX(-15deg)',
          },
        },
      },
    },
  },
  plugins: [],
}

export default config
