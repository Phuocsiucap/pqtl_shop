/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        Montserrat: ["Montserrat", "sans-serif"],
      },
      colors: {
        primary: "rgb(0, 173, 162)",
        second: "rgb(14, 14, 14)",
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
