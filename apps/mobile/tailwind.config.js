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
          text: '#2A2B2F',
          'text-dark': '#F8F3EC',
          muted: '#7B746A',
          'muted-dark': '#B5AA9E',
          background: '#F5F1EA',
          'background-dark': '#181513',
          surface: '#EEE9E1',
          'surface-dark': '#26211E',
          'surface-selected': '#E7DED2',
          'surface-selected-dark': '#332C27',
          accent: '#AA4D2E',
          'accent-dark': '#D88358',
          'accent-soft': '#F2D5C8',
          'accent-soft-dark': '#553526',
          border: '#DED5C9',
          'border-dark': '#403731',
          'success-soft': '#DCEBC9',
          'success-soft-dark': '#31402B',
          'success-text': '#5B7740',
          'success-text-dark': '#C8DEB0',
          'warning-soft': '#F5D4C4',
          'warning-soft-dark': '#4A2E23',
          'warning-text': '#9C4D30',
          'warning-text-dark': '#F4C0A6',
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
