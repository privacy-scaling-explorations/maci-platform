import { type Config } from "tailwindcss";
// eslint-disable-next-line import/no-extraneous-dependencies
import colors from "tailwindcss/colors";
// eslint-disable-next-line import/no-extraneous-dependencies
import theme from "tailwindcss/defaultTheme";

const customColors = {
  primary: {
    400: "#648fe4",
    500: "#698dff",
    600: "#346ddb",
    700: "#395794",
  },
  secondary: {
    100: "#EDF4FC",
    200: "#D7E6F9",
    600: "#2173DF",
    700: "#1C65C4",
  },
  success: {
    100: "#EEF6EE",
    200: "#DEEDDE",
    600: "#5BA85A",
    700: "#3F753E",
    800: "#3F753E",
  },
  error: {
    100: "#FDF6F2",
    200: "#FAEAE0",
    600: "#DD6B20",
    700: "#C45F1C",
  },
  highlight: {
    600: "#F3CF00",
  },
  gray: {
    50: "#F6F6F6",
    100: "#E7E7E7",
    200: "#D1D1D1",
    300: "#B0B0B0",
    400: "#888888",
    500: "#6D6D6D",
    600: "#5D5D5D",
    700: "#4F4F4F",
    800: "#454545",
    900: "#3D3D3D",
    950: "#0B0B0B",
  },
  blue: {
    50: "#F0F7FE",
    100: "#DEECFB",
    200: "#C4E0F9",
    300: "#9BCCF5",
    400: "#6BB1EF",
    500: "#579BEA",
    600: "#3476DC",
    700: "#2B62CA",
    800: "#2950A4",
    900: "#264682",
    950: "#1B2B50",
  },
  black: "#0B0B0B",
  lightBlack: "#111111",
  lighterBlack: "#222222",
  darkGray: "#5E5E5E",
  lightGray: "#CDCDCD",
  green: "#00FF00",
  red: "#EF4444",
  darkBlue: "#0D172D",
};

export default {
  content: ["./src/**/*.tsx"],
  darkMode: "selector",
  theme: {
    extend: {
      colors: {
        ...colors,
        ...customColors,
      },
      fontFamily: {
        sans: ["DM Sans", ...theme.fontFamily.sans],
        mono: ["Share Tech Mono", ...theme.fontFamily.mono],
      },
      width: {
        "112": "28rem",
        "128": "32rem",
      },
    },
  },
} satisfies Config;
