/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        Montserrat: ["Montserrat", "sans-serif"],
      },
      colors: {
        primary: '#2e7d32', // xanh lá đậm
        second: '#81c784',  // xanh lá nhạt
        third: "rgba(0, 0, 0, 0.8)",
        menu_color: "rgba(102, 102, 102, 0.85)",
      },
      container: {
        center: true,
        padding: {
          Default: "1 rem",
          sm: "3 rem",
        },
      },
    },
  },
  plugins: [],
};
