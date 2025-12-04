/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],

  safelist: [
    // ========================
    // 🎨 MÀU DÙNG TRONG MODULES
    // ========================

    // BLUE
    'bg-blue-50', 'bg-blue-100', 'bg-blue-500',
    'text-blue-600', 'text-blue-700',
    'border-blue-200', 'border-blue-500',

    // PURPLE
    'bg-purple-50', 'bg-purple-100', 'bg-purple-500',
    'text-purple-600', 'text-purple-700',
    'border-purple-200', 'border-purple-500',

    // EMERALD
    'bg-emerald-50', 'bg-emerald-100', 'bg-emerald-500',
    'text-emerald-600', 'text-emerald-700',
    'border-emerald-200', 'border-emerald-500',

    // ORANGE
    'bg-orange-50',
    'text-orange-700',
    'border-orange-500',

    // ROSE
    'bg-rose-50',
    'text-rose-700',
    'border-rose-500',
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

      // ========================
      // 💫 Animation Keyframes
      // ========================
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
        'slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },

      animation: {
        'gradient-move': 'gradientMove 6s ease infinite',
        'scroll-forward': 'scroll-forward 25s linear infinite',
        'scroll-reverse': 'scroll-reverse 25s linear infinite',
        'slide-up': 'slide-up 0.3s ease-out',
      },

      // ========================
      // 🎨 Gradient Reusable
      // ========================
      backgroundImage: {
        'cta-main': 'linear-gradient(270deg, #06B6D4, #8B5CF6, #06B6D4)',
        'cta-outline': 'linear-gradient(90deg, #10B981, #F59E0B)',
      },
    },
  },

  plugins: [
    // ========================
    // 3D Transform utilities
    // ========================
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
