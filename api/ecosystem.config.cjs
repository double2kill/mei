module.exports = {
  apps: [
    {
      name: "mei-api",
      cwd: __dirname,
      script: "dist/main.js",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: "8667",
      },
    },
  ],
};
