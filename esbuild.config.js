const esbuild = require('esbuild')

/** @type {import('esbuild').BuildOptions} */
const sharedConfig = {
  bundle: true,
  entryPoints: ['./src/index.ts'],
  minify: true,
  platform: 'node',
  sourcemap: true,
  target: 'node16',
}

esbuild
  .build({
    ...sharedConfig,
    outfile: './dist/cjs/index.js',
    format: 'cjs',
  })
  .catch(() => process.exit(1))

esbuild
  .build({
    ...sharedConfig,
    outfile: './dist/esm/index.js',
    format: 'esm',
  })
  .catch(() => process.exit(1))
