import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#C9A84C',
          light: '#D4AF37',
        },
        'bg-base': '#0a0a0a',
        'bg-card': '#111111',
        'bg-surface': '#141414',
      },
      fontFamily: {
        sans: ['var(--font-outfit)', 'sans-serif'],
      },
      fontWeight: {
        thin: '200',
        light: '300',
      },
    },
  },
  plugins: [],
}

export default config
