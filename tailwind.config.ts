import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background:   '#1A1A1A',
        surface:      '#2A2A2A',
        surfaceHigh:  '#3A3A3A',
        accent:       '#FF6B35',
        accentGreen:  '#00E676',
        textPrimary:  '#FFFFFF',
        textMuted:    '#9E9E9E',
        textDisabled: '#5A5A5A',
        danger:       '#FF4444',
        border:       '#3A3A3A',
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
