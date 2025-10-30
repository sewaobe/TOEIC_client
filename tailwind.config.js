/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  safelist: [
    // Background colors
    'bg-blue-50',
    'bg-indigo-50',
    'bg-purple-50',
    'bg-amber-50',
    'bg-rose-50',
    'bg-pink-50',
    'bg-teal-50',
    'bg-green-50',
    'bg-orange-50',
    'bg-cyan-50',
    'bg-violet-50',
    'bg-emerald-50',
    // Text colors
    'text-blue-600',
    'text-indigo-600',
    'text-purple-600',
    'text-amber-600',
    'text-rose-600',
    'text-pink-600',
    'text-teal-600',
    'text-green-600',
    'text-orange-600',
    'text-cyan-600',
    'text-violet-600',
    'text-emerald-600',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      boxShadow: {
        customCard: '0 6px 15px rgba(218,220,237,0.5)',
      },
      rotate: {
        'x-180': '180deg',
      },
      // 💫 Hiệu ứng gradient động
      keyframes: {
        gradientMove: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'scroll-forward': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'scroll-reverse': {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      animation: {
        'gradient-move': 'gradientMove 6s ease infinite',
        'scroll-forward': 'scroll-forward 25s linear infinite',
        'scroll-reverse': 'scroll-reverse 25s linear infinite',
      },
      // 🎨 Màu gradient tái sử dụng
      backgroundImage: {
        'cta-main': 'linear-gradient(270deg, #06B6D4, #8B5CF6, #06B6D4)',
        'cta-outline': 'linear-gradient(90deg, #10B981, #F59E0B)',
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.perspective': { perspective: '1000px' },
        '.transform-style-3d': { 'transform-style': 'preserve-3d' },
        '.backface-hidden': { 'backface-visibility': 'hidden' },
        '.rotate-y-180': { transform: 'rotateY(180deg)' },
      });
    },
  ],
};
