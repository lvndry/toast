// Replaced Chakra variant with a Tailwind-friendly descriptor for migration.
const Button = {
  variants: {
    "nav-link": ({ isActive }: { isActive?: boolean }) => ({
      className: isActive
        ? "font-medium text-gray-900 dark:text-white"
        : "font-medium text-gray-700 dark:text-gray-400",
      hover: "hover:text-gray-900 dark:hover:text-white transition-colors",
    }),
  },
};

export default Button;
