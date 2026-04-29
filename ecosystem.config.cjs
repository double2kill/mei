module.exports = {
  apps: [
    {
      name: "mei",
      cwd: __dirname,
      script: "node_modules/next/dist/bin/next",
      args: "start",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: "8666",
      },
    },
  ],
};
