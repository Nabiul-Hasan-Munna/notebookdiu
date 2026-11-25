/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        diu: {
          navy: '#0b1a3c',
          dark: '#060e22',
          blue: '#2563eb',
          'blue-hover': '#1d4ed8',
          sky: '#06b6d4',
          surface: '#ffffff',
          bg: '#f8fafc',
          border: '#e2e8f0'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      }
    },
  },
  plugins: [],
}
