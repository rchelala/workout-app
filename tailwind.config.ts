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
        sans: ['Barlow', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        display: ['Barlow Condensed', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-accent': '0 0 20px rgba(255, 107, 53, 0.35)',
        'glow-green':  '0 0 20px rgba(0, 230, 118, 0.35)',
        'card':        '0 4px 24px rgba(0, 0, 0, 0.4)',
        'card-hover':  '0 8px 32px rgba(0, 0, 0, 0.6)',
      },
    },
  },
  plugins: [],
}

export default config
