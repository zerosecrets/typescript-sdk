const {pathsToModuleNameMapper} = require('ts-jest')

/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
  coveragePathIgnorePatterns: ['<rootDir>/node_modules/'],
  moduleDirectories: ['node_modules', 'src'],
  moduleFileExtensions: ['ts', 'js'],

  moduleNameMapper: pathsToModuleNameMapper(
    {
      'sdk/*': ['./src/*'],
    },
    {prefix: '<rootDir>'},
  ),

  testPathIgnorePatterns: ['<rootDir>/node_modules/'],

  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        compilerOptions: {
          baseUrl: './',
          esModuleInterop: true,
          lib: [],
          module: 'commonjs',
          moduleResolution: 'node',
          noImplicitUseStrict: true,

          paths: {
            'sdk/*': ['./src/*'],
          },

          removeComments: true,
          resolveJsonModule: true,
          sourceMap: false,
          target: 'esnext',
          typeRoots: ['node_modules/@types', '@types'],
        },

        exclude: ['node_modules', 'dist'],
      },
    ],
  },
}

module.exports = config
