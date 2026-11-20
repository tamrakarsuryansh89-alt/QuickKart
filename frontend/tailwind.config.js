export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#e6f7fd',
          100: '#b3e6f8',
          200: '#80d5f4',
          300: '#4dc4ef',
          400: '#26b6ec',
          500: '#009CD4',
          600: '#0088bb',
          700: '#00709e',
          800: '#005880',
          900: '#004060',
          950: '#002840',
        },
        pink: {
          50:  '#fff0fb',
          100: '#ffd6f3',
          200: '#ffb8e8',
          300: '#fd96d9',
          400: '#fc86d0',
          500: '#FA79C5',
          600: '#e45dac',
          700: '#c44090',
          800: '#a02874',
          900: '#7a1457',
          950: '#4a0834',
        },
        qk: {
          blue: '#009CD4',
          pink: '#FA79C5',
          lightBlue: '#E6F7FD',
          lightPink: '#FFF0FB',
          bg: '#F7FBFE',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif']
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #009CD4 0%, #FA79C5 100%)',
        'brand-gradient-soft': 'linear-gradient(135deg, #E6F7FD 0%, #FFF0FB 100%)',
      },
      boxShadow: {
        'blue-glow': '0 4px 24px -4px rgba(0,156,212,0.35)',
        'pink-glow': '0 4px 24px -4px rgba(250,121,197,0.35)',
      }
    },
  },
  plugins: [],
}
