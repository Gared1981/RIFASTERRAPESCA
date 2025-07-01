/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta de colores basada en el logotipo de Terrapesca
        terrapesca: {
          // Azul principal del logo
          blue: {
            50: '#f0f9ff',
            100: '#e0f2fe',
            200: '#bae6fd',
            300: '#7dd3fc',
            400: '#38bdf8',
            500: '#003B73', // Color principal del logo
            600: '#002850',
            700: '#001f3f',
            800: '#001a35',
            900: '#00152b'
          },
          // Rojo/naranja del logo
          orange: {
            50: '#fff7ed',
            100: '#ffedd5',
            200: '#fed7aa',
            300: '#fdba74',
            400: '#fb923c',
            500: '#FF6B35', // Color secundario del logo
            600: '#ea580c',
            700: '#c2410c',
            800: '#9a3412',
            900: '#7c2d12'
          },
          // Gris claro del logo
          gray: {
            50: '#f9fafb',
            100: '#f3f4f6',
            200: '#e5e7eb',
            300: '#d1d5db',
            400: '#9ca3af',
            500: '#EDF2F4', // Gris claro del logo
            600: '#4b5563',
            700: '#374151',
            800: '#1f2937',
            900: '#111827'
          },
          // Verde para elementos de éxito y pesca
          green: {
            50: '#f0fdf4',
            100: '#dcfce7',
            200: '#bbf7d0',
            300: '#86efac',
            400: '#4ade80',
            500: '#22c55e',
            600: '#16a34a',
            700: '#15803d',
            800: '#166534',
            900: '#14532d'
          }
        },
        // Mantener colores originales para compatibilidad
        primary: {
          DEFAULT: '#003B73',
          light: '#0074B3',
          dark: '#002850'
        },
        secondary: {
          DEFAULT: '#FF6B35',
          light: '#FF8A5B',
          dark: '#E55A2B'
        },
        accent: {
          DEFAULT: '#EDF2F4',
          dark: '#8D99AE'
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      boxShadow: {
        'terrapesca': '0 4px 14px 0 rgba(0, 59, 115, 0.15)',
        'terrapesca-lg': '0 10px 25px -3px rgba(0, 59, 115, 0.1), 0 4px 6px -2px rgba(0, 59, 115, 0.05)',
      }
    },
  },
  plugins: [],
};