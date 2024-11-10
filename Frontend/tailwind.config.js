/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {width: {
      '128': '28rem',
      '92':'21rem',
    },
  fontFamily:{
    stencil:['"Stencil Std"', 'fantasy'], 
    comic: ['"Comic Sans MS"', 'Comic Sans', '"Comic Neue"', 'cursive'],
  }
  },
  },
  plugins: [
    require('daisyui'),    
  ],
}


