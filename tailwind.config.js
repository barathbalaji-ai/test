/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#E9E3D6',
        'paper-deep': '#DED7C6',
        chalk: '#F5F1E8',
        ink: '#1A1712',
        'ink-soft': '#524D43',
        marker: '#E0382B',
        oxblood: '#8E2A20',
        stone: '#9A948A',
        taupe: '#C7BCA6',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        hand: ['Caveat', 'cursive'],
        mono: ['"Space Mono"', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        tightest: '-0.045em',
      },
      boxShadow: {
        hard: '7px 9px 0 rgba(26,23,18,0.9)',
        'hard-sm': '4px 5px 0 rgba(26,23,18,0.85)',
        'hard-red': '7px 9px 0 #E0382B',
      },
      borderRadius: {
        DEFAULT: '3px',
      },
    },
  },
  plugins: [],
}
