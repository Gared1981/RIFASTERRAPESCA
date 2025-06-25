/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#003B73', // Dark Blue from logo
          light: '#0074B3',
          dark: '#002850'
        },
        secondary: {
          DEFAULT: '#D62828', // Red from logo
          light: '#E84545',
          dark: '#B31B1B'
        },
        accent: {
          DEFAULT: '#EDF2F4', // Light gray for backgrounds
          dark: '#8D99AE'
        }
      }
    },
  },
  plugins: [],
};