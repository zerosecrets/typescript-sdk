/** @type {import('esbuild').BuildOptions} */
const config = {
  entryPoints: ['./src/index.ts'],
  platform: 'node',
  outfile: 'index.js',
  target: 'node16',
  bundle: true,
  minify: true,
  sourcemap: true,
}

require('esbuild')
  .build(config)
  .catch(() => process.exit(1))
