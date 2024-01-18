/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */

module.exports = {
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFiles: [
    "./setupJest.js"
  ]
};
