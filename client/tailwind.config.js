/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        jt: {
          orange: '#F26522',
          'orange-dark': '#D4521A',
          'orange-light': '#FFE7D8',
          blue: '#1B3A6B',
          'blue-dark': '#102449',
          'blue-light': '#E8EFFA',
        },
        accent: {
          green: '#16A34A',
          'green-light': '#DCFCE7',
          yellow: '#FACC15',
          red: '#DC2626',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: {
        card: '14px',
        'card-lg': '20px',
      },
      boxShadow: {
        'jt-sm': '0 1px 2px rgba(15,23,42,.06)',
        'jt-md': '0 6px 20px rgba(15,23,42,.08)',
        'jt-lg': '0 20px 40px rgba(15,23,42,.12)',
      },
    },
  },
  plugins: [],
};
