const {pathsToModuleNameMapper} = require('ts-jest');
const {compilerOptions} = require('./jest.tsconfig.json');

/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {prefix: '<rootDir>'}),

  coveragePathIgnorePatterns: [
    "<rootDir>/node_modules/"
  ],

  globals: {
    "ts-jest": {
      "tsconfig": "jest.tsconfig.json"
    }
  },

  moduleFileExtensions: [
    "ts",
    "js"
  ],

  moduleDirectories: [
    "node_modules",
    "src"
  ],

  testPathIgnorePatterns: [
    "<rootDir>/node_modules/"
  ],

  transform: {
    "^.+\\.ts$": "ts-jest"
  }
}

module.exports = config
