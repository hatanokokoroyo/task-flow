/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'status-todo': {
          bg: '#f3f4f6',
          text: '#374151',
        },
        'status-design': {
          bg: '#dbeafe',
          text: '#1e40af',
        },
        'status-dev': {
          bg: '#dcfce7',
          text: '#166534',
        },
        'status-test': {
          bg: '#fef9c3',
          text: '#854d0e',
        },
        'status-deploy': {
          bg: '#ffedd5',
          text: '#9a3412',
        },
        'status-done': {
          bg: '#dcfce7',
          text: '#166534',
        },
      }
    },
  },
  plugins: [],
}

