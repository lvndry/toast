// Tailwind-friendly feature theme stub to aid migration away from Chakra.
const Features = {
  parts: ["container", "title", "description", "icon"],
  baseStyle: {
    container: "flex items-start flex-row",
    title: "text-lg font-medium mb-2",
    description: "text-base text-gray-500",
    icon: "mb-3 mr-3 p-2 rounded bg-primary text-white",
  },
  variants: {
    subtle: {},
    solid: {
      container: "bg-primary",
    },
    light: (mode: "light" | "dark") => ({
      container: mode === "dark" ? "bg-gray-700" : "bg-gray-100",
    }),
  },
  defaultProps: {
    variant: "subtle",
  },
};

export const Feature = {
  parts: ["container", "title", "description", "icon"],
  baseStyle: {
    container: "flex flex-col items-start",
    title: "text-xl font-bold mb-2",
    description: "text-lg text-gray-500",
    icon: "mb-4 mr-4 p-2 rounded bg-primary-100 text-primary-700",
  },
  variants: {
    default: {},
    "left-icon": { container: "flex flex-row" },
    center: { container: "items-center text-center" },
  },
  defaultProps: {
    variant: "default",
  },
};

export default Features;
