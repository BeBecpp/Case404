/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Case404 palette — deep evidence-room dark with cyan/green signal accents.
        ink: {
          950: '#05080d',
          900: '#080c14',
          850: '#0b111c',
          800: '#0f1726',
          700: '#16203450',
        },
        signal: {
          cyan: '#22e0d4',
          green: '#39ff9e',
          dim: '#0e6b66',
        },
        alert: '#ff4d6d',
        amber: '#ffb347',
      },
      fontFamily: {
        mono: [
          'ui-monospace',
          'JetBrains Mono',
          'Fira Code',
          'SFMono-Regular',
          'Menlo',
          'Consolas',
          'monospace',
        ],
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(34,224,212,0.15), 0 0 24px -6px rgba(34,224,212,0.35)',
        'glow-green':
          '0 0 0 1px rgba(57,255,158,0.18), 0 0 26px -6px rgba(57,255,158,0.4)',
      },
      keyframes: {
        blink: {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0' },
        },
        flicker: {
          '0%, 100%': { opacity: '0.9' },
          '50%': { opacity: '0.6' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        blink: 'blink 1s steps(1) infinite',
        flicker: 'flicker 4s ease-in-out infinite',
        'fade-up': 'fade-up 0.4s ease-out both',
      },
    },
  },
  plugins: [],
}
