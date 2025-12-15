const Section = {
  baseStyle: {
    pt: 28,
    pb: 28,
    px: [4, null],
  },
  variants: {
    subtle: {},
    solid: { className: "bg-primary" },
    alternate: (mode: "light" | "dark") => ({
      className: mode === "dark" ? "bg-gray-800" : "bg-gray-50",
    }),
  },
  defaultProps: { variant: "subtle" },
};

export default Section;
