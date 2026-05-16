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
          green: '#2d5a27',
          'green-light': '#4a8c3f',
          'green-bg': '#f4faf3',
          purple: '#5a2d6e',
          red: '#8c3f2d',
          blue: '#1a3a6e',
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
