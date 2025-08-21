/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // PlayTale brand colors baseret på billederne
        'playtale': {
          primary: '#2E3A8C', // Mørk blå fra logo/tekst
          secondary: '#7C3AED', // Lilla fra design
          accent: {
            pink: '#EC4899',
            orange: '#F97316', 
            yellow: '#EAB308',
            green: '#10B981',
            blue: '#3B82F6',
            cyan: '#06B6D4',
          }
        },
        'brown': {
          600: '#8B4513'
        }
      },
      fontFamily: {
        'playtale': ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'playtale': '20px',
      }
    },
  },
  plugins: [],
}
