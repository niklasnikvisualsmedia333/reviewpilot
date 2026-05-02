/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#08111f',
        panel: '#0d1728',
        line: '#203047',
        accent: '#2dd4bf',
        gold: '#f4c95d'
      },
      boxShadow: {
        glow: '0 18px 80px rgba(45, 212, 191, 0.13)'
      }
    }
  },
  plugins: []
};
