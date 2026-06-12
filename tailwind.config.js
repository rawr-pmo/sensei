export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        sensei: {
          purple: '#6D28D9',
          orange: '#F97316',
          teal: '#0D9488',
          pink: '#DB2777',
          blue: '#2563EB',
          green: '#16A34A',
          yellow: '#EAB308'
        }
      },
      fontSize: {
        'xxl': '1.75rem',
        'xxxl': '2.5rem'
      }
    }
  },
  plugins: []
};
