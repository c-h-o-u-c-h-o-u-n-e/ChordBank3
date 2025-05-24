/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: '#CD2928',
        'accent-hover': '#A02020',
        'bg-light': '#F8F4E3',
        'bg-dark': '#1C1B19',
        'text-dark': '#2D2A26',
        'text-muted': '#6F6655',
        'text-light': '#BFAE9A',
        'text-muted-dark': '#9B9280',
        'border-light': '#D5C7AA',
        'border-dark': '#3A3630',
      },
      fontFamily: {
        'title': ['NewPoppins', 'sans-serif'],
        'body': ['NewPoppins', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};