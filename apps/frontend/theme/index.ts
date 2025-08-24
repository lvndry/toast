import { extendTheme } from "@chakra-ui/react";
import { theme as baseTheme } from "@saas-ui/react";

import components from "./components";
import { fontSizes } from "./foundations/typography";

import "@fontsource-variable/inter";

export const theme = extendTheme(
  {
    config: {
      initialColorMode: "dark",
      useSystemColorMode: false,
    },
    styles: {
      global: (props: any) => ({
        body: {
          color: "gray.900",
          bg: "white",
          fontSize: "lg",
          _dark: {
            color: "white",
            bg: "gray.900",
          },
        },
      }),
    },
    fonts: {
      heading: "Inter Variable, Inter, sans-serif",
      body: "Inter Variable, Inter, sans-serif",
    },
    fontSizes,
    components,
  },
  baseTheme,
);
