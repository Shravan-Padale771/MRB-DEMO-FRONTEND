import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173",
    specPattern: "src/__tests__/e2e/**/*.cy.js",
    supportFile: false,
    viewportWidth: 1440,
    viewportHeight: 900,
    defaultCommandTimeout: 10000,
    video: true,
    screenshotOnRunFailure: true,
  },

  component: {
    devServer: {
      framework: "react",
      bundler: "vite",
    },
  },
});
