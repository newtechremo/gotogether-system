module.exports = {
  launch: {
    headless: process.env.HEADLESS !== 'false',
    slowMo: process.env.SLOW_MO ? parseInt(process.env.SLOW_MO) : 0,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
    defaultViewport: {
      width: 1920,
      height: 1080,
    },
  },
  server: {
    command: 'npm run dev',
    port: 3001,
    launchTimeout: 30000,
    waitOnScheme: {
      delay: 1000,
    },
  },
};
