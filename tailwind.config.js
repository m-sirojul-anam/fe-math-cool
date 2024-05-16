/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      screens: { 'sm': { 'max': "640px" } },
    },
  },
  plugins: [require("@tailwindcss/aspect-ratio")],
};
