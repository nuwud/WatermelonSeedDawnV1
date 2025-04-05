import type { Config } from 'tailwindcss'
import remToPx from 'tailwindcss-rem-to-px';

export default {
  content: [
    './src/**/*.{vue,js,ts}',
    './**/*.{liquid,json,js}'
  ],
  theme: {
    extend: {
      spacing: {
        fullscreen: '100vh',
      }
    }
  },
  plugins: [
    remToPx({
      baseFontSize: 16
    }) as any,
  ],
} satisfies Config
