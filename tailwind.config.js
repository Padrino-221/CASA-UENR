/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
        colors: {
          primary: 'var(--primary)',
          'primary-light': 'var(--primary-light)',
          main: 'var(--text-main)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          accent: '#8B5CF6',
          standard: 'var(--border-standard)',
          subtle: 'var(--border-subtle)',
          'bg-main': 'var(--bg-main)',
          'bg-card': 'var(--bg-card)',
          card: 'var(--bg-card)',
          'page-bg': 'var(--bg-main)',
        },
      fontFamily: {
        sans: ['var(--font-plus-jakarta)', 'system-ui', 'sans-serif'],
        primary: ['var(--font-plus-jakarta)', 'sans-serif'],
        secondary: ['var(--font-plus-jakarta)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
