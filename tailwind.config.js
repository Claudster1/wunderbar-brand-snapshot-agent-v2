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
      colors: {
        'brand-navy': '#021859',
        'brand-blue': '#07B0F2',
        'brand-blueHover': '#059BD8',
        'brand-aqua': '#27CDF2',
        'brand-midnight': '#0C1526',
        'brand-gray': '#F2F2F2',
        'brand-border': '#E0E3EA',
      },
    },
  },
  plugins: [],
}

