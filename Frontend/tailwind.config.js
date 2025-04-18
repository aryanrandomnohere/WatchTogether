import daisyui from 'daisyui'
import tailwindScrollbar from "tailwind-scrollbar"
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'custom-slate': {
          950: '#1a1a1a', // This is a darker shade of slate
        }},
      width: {
      '128': '28rem',
      '150':'33rem',
      '92':'21rem',
      '68':'280px',
      '76':'19rem',
    },
    height: {
      '128': '28rem',
      '150':'33rem',
      '92':'21rem',
      '76':'19rem',
      '68':"285px",
      '86':'340px',
      '94':'22rem'
    },
    gap:{
      "2.7":'9px'
    },
    margin:{
    '22': '85px',
    '26': '102px'
    },
    padding:{
    '2.7':'11px'
    },
   
  fontFamily:{
    stencil:['"Stencil Std"', 'fantasy'], 
    comic: ['"Comic Sans MS"', 'Comic Sans', '"Comic Neue"', 'cursive'],
  }
  },
  },
  plugins: [
    daisyui,
    tailwindScrollbar
  ],
}


