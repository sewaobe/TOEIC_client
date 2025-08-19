/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      boxShadow: {
        customCard: '0 6px 15px rgba(218,220,237,0.5)',
      },
    },
  },
  plugins: [],
};
