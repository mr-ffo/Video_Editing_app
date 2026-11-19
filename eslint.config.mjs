import { config } from "@remotion/eslint-config-flat";

export default [
  ...config,
  {
    files: ["app/**/*.{ts,tsx}"],
    rules: {
      "@remotion/non-pure-animation": "off",
    },
  },
];
