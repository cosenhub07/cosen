/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        stripe: {
          purple: '#635BFF',
          'purple-dark': '#533AFD',
          'purple-hover': '#7A73FF',
          slate: '#0A2540',
          steel: '#425466',
          muted: '#8792A2',
          bg: '#F6F9FC',
          white: '#FFFFFF',
          border: '#E6EBF1',
          'teal-accent': '#00D4FF',
          'pink-accent': '#FF00BE',
          'orange-accent': '#FF9B00',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['Syne', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'stripe-card': '0 30px 60px -12px rgba(50, 50, 93, 0.25), 0 18px 36px -18px rgba(0, 0, 0, 0.3)',
        'stripe-card-sm': '0 6px 12px -2px rgba(50, 50, 93, 0.25), 0 3px 7px -3px rgba(0, 0, 0, 0.3)',
        'stripe-btn': '0 4px 6px -1px rgba(50, 50, 93, 0.11), 0 2px 4px -1px rgba(0, 0, 0, 0.08)',
      },
      animation: {
        'gradient-shift': 'gradient-shift 8s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'fade-up': 'fade-up 0.6s ease-out forwards',
        'marquee': 'marquee 25s linear infinite',
      },
      keyframes: {
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'marquee': {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        }
      }
    },
  },
  plugins: [],
}
