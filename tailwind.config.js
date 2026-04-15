/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1A1A2E',
        accent: '#4F46E5',
        surface: '#F8F9FF',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        muted: '#6B7280',
      },
      fontFamily: {
        sans: ['-apple-system', 'SF Pro Display', 'System'],
      },
    },
  },
  plugins: [require('nativewind/tailwind/native')],
};
