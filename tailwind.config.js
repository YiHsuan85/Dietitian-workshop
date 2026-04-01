/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // 這樣它才會掃描 src 資料夾
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
