/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    boxShadow: {
      "inner-light": "inset 0 1px 3px rgba(0, 0, 0, 0.2)", // Lighter shadow
      "inner-strong": "inset 0 4px 6px rgba(0, 0, 0, 0.6)", // Stronger shadow
    },

    screens: {
      "2xl": { max: "1535px" },
      // => @media (max-width: 1535px) { ... }

      xl: { max: "1279px" },
      // => @media (max-width: 1279px) { ... }

      lg: { max: "1023px" },
      // => @media (max-width: 1023px) { ... }

      md: { max: "767px" },
      // => @media (max-width: 767px) { ... }

      sm: { max: "639px" },
      // => @media (max-width: 639px) { ... }
    },
    extend: {
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        fadeInFast: "fadeIn 0.2s ease",
        fadeInSlow: "fadeIn 0.5s ease",
      },
    },
  },
  plugins: [],
};
