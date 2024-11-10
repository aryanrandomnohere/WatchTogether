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
    }},
  },
  plugins: [
    require('daisyui'),    
  ],
}


