/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        brand: ['var(--font-lato)', 'Lato', 'system-ui', 'sans-serif'],
      },
      colors: {
        'brand-navy': '#021859',
        'brand-blue': '#07B0F2',
        'brand-blueHover': '#059BD8',
        'brand-aqua': '#27CDF2',
        'brand-midnight': '#0C1526',
        'brand-gray': '#F2F2F2',
        'brand-light': '#F8F9FA',
        'brand-border': '#E0E3EA',
        'brand-muted': '#5a6c8a',
        'brand-bg': '#f5f7fb',
      },
      maxWidth: {
        'brand-narrow': '700px',
        'brand-medium': '900px',
        'brand-wide': '960px',
      },
      transitionTimingFunction: {
        brand: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
      },
    },
  },
  plugins: [],
}

