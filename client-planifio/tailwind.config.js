/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [],
  theme: {
    extend: {
      borderRadius:
      {
        default: "0.375rem",
        sm: "0.125rem",
        lg: "0.5rem",
        full: "9999px",
        none: "0px",
        md: "0.375rem",
      }
    },
  },
  plugins: [require("rippleui")],
}

