// Tailwind-friendly SectionTitle stub for migrating away from Chakra
const SectionTitle = {
  parts: ["wrapper", "title", "description"],
  baseStyle: {
    wrapper: "mb-10 text-left lg:text-center",
    title: "w-full",
    description: "font-normal",
  },
  variants: {
    default: { description: "text-gray-500 dark:text-gray-400" },
    dark: { title: "text-gray-800", description: "text-gray-700" },
    light: { title: "text-white", description: "text-gray-200" },
  },
  defaultProps: { variant: "default", size: "xl" },
  sizes: {
    lg: { title: "text-2xl", description: "text-xl" },
    xl: {
      wrapper: "mb-14",
      title: "text-4xl lg:text-4xl",
      description: "text-2xl",
    },
  },
};

export default SectionTitle;
