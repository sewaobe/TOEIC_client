/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      boxShadow: {
        customCard: '0 6px 15px rgba(218,220,237,0.5)',
      },
      rotate: {
        'x-180': '180deg', // thêm rotateY(180)
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.perspective': {
          perspective: '1000px',
        },
        '.transform-style-3d': {
          'transform-style': 'preserve-3d',
        },
        '.backface-hidden': {
          'backface-visibility': 'hidden',
        },
        '.rotate-y-180': { transform: 'rotateY(180deg)' }, // thêm dòng này
      });
    },
  ],
};
