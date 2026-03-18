export default [
  {
    ignores: [
      "node_modules/**",
      "output/**",
      "test-results/**",
      "playwright-report/**",
      "logs/**",
      ".playwright-cli/**"
    ]
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        location: "readonly",
        console: "readonly"
      }
    },
    rules: {}
  }
];
