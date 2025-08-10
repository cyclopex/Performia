/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        secondary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        accent: {
          50: '#fef7ee',
          100: '#fdedd6',
          200: '#fbd7ad',
          300: '#f8bb84',
          400: '#f5955a',
          500: '#f26b31',
          600: '#e34d1c',
          700: '#bc3a18',
          800: '#95301a',
          900: '#782a18',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-sport': 'linear-gradient(135deg, #0ea5e9 0%, #22c55e 100%)',
      },
      boxShadow: {
        'sport': '0 10px 25px -3px rgba(14, 165, 233, 0.1), 0 4px 6px -2px rgba(34, 197, 94, 0.05)',
        'sport-lg': '0 20px 25px -5px rgba(14, 165, 233, 0.1), 0 10px 10px -5px rgba(34, 197, 94, 0.04)',
      }
    },
  },
  plugins: [],
}
