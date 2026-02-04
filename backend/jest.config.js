module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'utils/**/*.js',
    'middleware/**/*.js',
    '!node_modules/**'
  ],
  testMatch: ['**/__tests__/**/*.test.js'],
  verbose: true
};
