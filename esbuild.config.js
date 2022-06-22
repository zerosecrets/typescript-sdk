/** @type {import('esbuild').BuildOptions} */
const config = {
  entryPoints: ['./src/index.ts'],
  outdir: 'dist',
  platform: 'node',
  target: 'node16',
  bundle: true,
  minify: true,
  sourcemap: true,
}

require('esbuild')
  .build(config)
  .catch(() => process.exit(1))
