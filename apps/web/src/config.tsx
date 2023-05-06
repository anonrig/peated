const config = {
  ENV: import.meta.env.PROD ? "production" : "development",
  DEBUG: import.meta.env.DEV,
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || "",
  SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN || "",

  GITHUB_REPO: "https://github.com/dcramer/peated",
};

export default config;