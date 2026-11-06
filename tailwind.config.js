/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#142D4A',
          900: '#0B172A',
          850: '#193957',
          800: '#10243D',
          750: '#1C3B5A',
          700: '#294968',
          600: '#365B7A',
          500: '#527394',
        },
        fg: {
          DEFAULT: '#F1F5F9',
          muted: '#A9BCD2',
          subtle: '#7890A9',
        },
        accent: {
          DEFAULT: '#3B82F6',
          hover: '#2563EB',
          soft: 'rgba(59,130,246,0.16)',
          line: 'rgba(56,189,248,0.35)',
        },
        glow: {
          DEFAULT: '#38BDF8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      boxShadow: {
        panel: '0 1px 0 rgba(148,190,230,0.08) inset, 0 12px 32px -16px rgba(2,8,23,0.72), 0 0 24px -16px rgba(56,189,248,0.3)',
      },
    },
  },
  plugins: [],
};
