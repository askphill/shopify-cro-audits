import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ap: {
          red: "#DE0015",
          redLight: "#f7bad4",
          redDark: "#850009",
          green: "#0DC147",
          greenLight: "#b9f0d8",
          greenDark: "#035716",
          greyLight: "#FAF8F7",
          greyDark: "#898989",
          brown: "#D8CCB5",
          brownLight: "#f0ece1",
          brownDark: "#614125",
          blue: "#1E90FF",
          blueLight: "#c7edff",
          blueDark: "#1761BF",
        },
        black: "#131313",
      },
      boxShadow: {
        "ap-popup": "0px 4px 25px rgba(0, 0, 0, 0.1)",
      },
    },
  },
  plugins: [],
} satisfies Config;
