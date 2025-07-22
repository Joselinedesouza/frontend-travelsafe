/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['"Poppins"', "sans-serif"],
      },
      keyframes: {
        fly: {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "50%": { opacity: "1" },
          "100%": { transform: "translateX(100%)", opacity: "0" },
        },
      },
      animation: {
        fly1: "fly 5s linear infinite",
        fly2: "fly 7s linear infinite",
        fly3: "fly 9s linear infinite",
      },

      colors: {
        petrolio: "#0d4f4b", // un verde petrolio più acceso
        azzurrochiaro: "#4db6ac", // azzurro più luminoso e moderno
        darksafe: "#009688",
      },
    },
  },
  plugins: [],
};
