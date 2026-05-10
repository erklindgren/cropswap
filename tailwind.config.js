/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        soil:   { 50:'#F5F0E8', 100:'#E8DCC8', 200:'#D4BC96', 300:'#BC9A64', 400:'#9E7A42', 500:'#7D5C28', 600:'#634818', 700:'#4A3410', 800:'#32220A', 900:'#1E1205' },
        moss:   { 50:'#EAF3DE', 100:'#CCDFB0', 200:'#A8C87A', 300:'#80AD48', 400:'#5C9224', 500:'#3D7010', 600:'#2D5F16', 700:'#1F4610', 800:'#122E09', 900:'#081804' },
        stone:  { 50:'#F7F5F0', 100:'#EBE8E0', 200:'#D4CFC3', 300:'#B8B2A3', 400:'#9A9385', 500:'#7D7568', 600:'#62594E', 700:'#4A4238', 800:'#322D26', 900:'#1C1812' },
        clay:   { 50:'#FBF0EA', 100:'#F5D9C8', 200:'#EDBB9E', 300:'#E09970', 400:'#CF7745', 500:'#B55C26', 600:'#8F4419', 700:'#6B3011', 800:'#481F0A', 900:'#271005' },
        cream:  '#FAF8F3',
        parchment: '#F0EBE0',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body:    ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono:    ['"DM Mono"', 'monospace'],
      },
      borderRadius: { xl:'1rem', '2xl':'1.5rem', '3xl':'2rem' },
      boxShadow: {
        'card':  '0 1px 3px rgba(30,18,5,0.08), 0 4px 16px rgba(30,18,5,0.06)',
        'lift':  '0 4px 12px rgba(30,18,5,0.12), 0 16px 40px rgba(30,18,5,0.10)',
        'inset': 'inset 0 1px 3px rgba(30,18,5,0.10)',
      },
    },
  },
  plugins: [],
}

