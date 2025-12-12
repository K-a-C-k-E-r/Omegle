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
        omegle: {
          blue: '#0099ff',
          dark: '#1a1a1a',
          light: '#f0f0f0',
        }
      }
    },
  },
  plugins: [],
}
export default config
