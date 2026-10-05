export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: {
    colors: { navy: { DEFAULT: '#0F2238', 700: '#183552', 900: '#091624' }, amber: { DEFAULT: '#E39A2D', soft: '#FBEBCF' }, mist: '#F2F4F7' },
    fontFamily: { display: ['"Bricolage Grotesque"', 'sans-serif'], sans: ['Figtree', 'sans-serif'] },
  } },
};
