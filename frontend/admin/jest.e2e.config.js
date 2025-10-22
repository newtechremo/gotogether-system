module.exports = {
  preset: 'jest-puppeteer',
  testRegex: './*\\.e2e\\.test\\.js$',
  testTimeout: 60000,
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/e2e/setup.js'],
  globals: {
    BASE_URL: 'http://localhost:3001',
    API_URL: 'http://localhost:3000',
  },
  collectCoverage: false,
  verbose: true,
};
