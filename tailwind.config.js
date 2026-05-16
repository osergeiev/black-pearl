/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', 'system-ui', 'sans-serif']
      },
      colors: {
        brand: {
          green: '#5C7CFF',
          'green-light': '#8EA2FF',
          'green-bg': '#EEF2FF',
          teal: '#21A6A1',
          'teal-bg': '#E8FAF8',
          coral: '#FF6B6B',
          'coral-bg': '#FFF0EE',
          amber: '#F4B740',
          purple: '#7C5CFF',
          red: '#FF6B6B',
          blue: '#2F80ED',
          cream: '#faf8f4',
          beige: '#f0ebe3',
          'beige-dark': '#e8e2d8',
          muted: '#8a8070'
        }
      }
    }
  },
  plugins: []
};
