/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Josefin Sans"', 'system-ui', 'sans-serif']
      },
      colors: {
        brand: {
          green: '#00626F',
          'green-light': '#0E7F8F',
          'green-bg': '#E6F3F4',
          teal: '#008E9B',
          'teal-bg': '#E7F8F9',
          coral: '#E86F5C',
          'coral-bg': '#FFF1EE',
          amber: '#E6A83A',
          purple: '#36536B',
          red: '#E86F5C',
          blue: '#147A8A',
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
