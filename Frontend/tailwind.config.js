/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {width: {
      '128': '28rem',
      '150':'33rem',
      '92':'21rem',
      
    },
    margin:{
    '22': '85px'
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


