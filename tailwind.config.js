/** ============================================================
 *  Tailwind config — The Plumb Doctor Ltd
 *  Brand colours + fonts live here. Change them once, rebuild
 *  (npm run build) and the whole site updates.
 *  ============================================================ */
module.exports = {
  content: ['./index.html', './assets/js/**/*.js'],
  theme: {
    extend: {
      colors: {
        // Logo navy — the ink colour of the wrench + stethoscope logo
        navy: {
          DEFAULT: '#073556',
          900: '#04223A',
          800: '#062C49',
          700: '#0B3F66',
          600: '#1C527D',
          400: '#5E86A8',
        },
        // Scrubs blue — the logo's own background colour
        scrubs: {
          DEFAULT: '#D5E7F3',
          dark: '#BFD9EC',
          light: '#EAF3FA',
        },
        chart: '#F3F8FC', // pale "medical chart" paper for light sections
        sunny: {
          DEFAULT: '#FFC93C', // buttons — yellow from the oil boiler flyer
          light: '#FFE08A',
          dark: '#E8A800',
        },
        pulse: {
          DEFAULT: '#2ED39B', // healthy heartbeat green
          dark: '#14A673',
        },
        copper: {
          DEFAULT: '#C97A3F', // pipework
          light: '#E9A46D',
          dark: '#8F4F22',
        },
        coral: {
          DEFAULT: '#FF6A55', // "poorly" + emergencies only
          dark: '#D9422D',
        },
        muted: '#4A6680', // body text on light backgrounds
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        sans: ['Figtree', 'system-ui', 'sans-serif'],
        hand: ['Caveat', 'cursive'], // "doctor's handwriting" — notes only
      },
      maxWidth: {
        site: '1200px',
      },
      boxShadow: {
        pad: '0 1px 0 #fff inset, 0 30px 60px -30px rgba(7,53,86,.45)',
        btn: '0 4px 0 #E8A800',
        'btn-navy': '0 4px 0 #04223A',
      },
      keyframes: {
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
      },
      animation: {
        marquee: 'marquee 40s linear infinite',
      },
    },
  },
  plugins: [],
};
