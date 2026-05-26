const { platformSelect } = require('nativewind/theme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'media',
  content: ['./src/**/*.{js,jsx,ts,tsx}', './app/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        app: {
          text: '#17201A',
          'text-dark': '#F2F7F3',
          muted: '#66736B',
          'muted-dark': '#A8B3AB',
          background: '#F8FAF8',
          'background-dark': '#101411',
          surface: '#FFFFFF',
          'surface-dark': '#181D19',
          'surface-selected': '#EEF7F1',
          'surface-selected-dark': '#203025',
          accent: '#94D7A8',
          'accent-dark': '#94D7A8',
          'accent-soft': '#DFF4E5',
          'accent-soft-dark': '#183424',
          border: '#E2E8E2',
          'border-dark': '#2A342D',
          'success-soft': '#DFF4E5',
          'success-soft-dark': '#183424',
          'success-text': '#25623A',
          'success-text-dark': '#AEEBC0',
          'warning-soft': '#FEF3C7',
          'warning-soft-dark': '#3C2F12',
          'warning-text': '#92400E',
          'warning-text-dark': '#F7D774',
          danger: '#F05A4F',
        },
      },
      fontFamily: {
        sans: platformSelect({
          ios: 'System',
          android: 'sans-serif',
          default: 'var(--font-display)',
        }),
        mono: platformSelect({
          ios: 'ui-monospace',
          android: 'monospace',
          default: 'var(--font-mono)',
        }),
      },
      boxShadow: {
        ambient: '0px 8px 18px rgba(0,0,0,0.16)',
      },
      maxWidth: {
        content: '800px',
      },
    },
  },
  plugins: [],
};
