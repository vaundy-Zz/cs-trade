export default {
  testEnvironment: 'node',
  transform: {},
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: [
    'src/server/**/*.js',
    '!src/server/index.js',
    '!src/server/load-env.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
};
