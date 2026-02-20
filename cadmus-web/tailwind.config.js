/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: 'rgb(var(--bg-base) / <alpha-value>)',
        surface: 'rgb(var(--bg-surface) / <alpha-value>)',
        muted: 'rgb(var(--bg-muted) / <alpha-value>)',
        text: 'rgb(var(--fg-text) / <alpha-value>)',
        subtext: 'rgb(var(--fg-subtext) / <alpha-value>)',
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)',
      },
      fontFamily: {
        ui: ['var(--font-ui)', 'monospace'],
        content: ['var(--font-content)', 'serif'],
      },
      boxShadow: {
        hard: 'var(--shadow-hard)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}