import type { Config } from 'tailwindcss'
import remToPx from 'tailwindcss-rem-to-px';

export default {
  content: ['./*/*.{liquid,json,js}'],
  theme: {
  },
  plugins: [
    remToPx({
      baseFontSize: 16
    }),
  ],
} satisfies Config
