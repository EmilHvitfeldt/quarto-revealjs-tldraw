import * as esbuild from 'esbuild'

const watch = process.argv.includes('--watch')

const ctx = await esbuild.context({
  entryPoints: ['src/index.tsx'],
  bundle: true,
  format: 'iife',
  outfile: '_extensions/tldraw/tldraw.js',
  loader: {
    '.tsx': 'tsx',
    '.ts': 'ts',
    '.css': 'css',
    '.woff': 'dataurl',
    '.woff2': 'dataurl',
    '.svg': 'dataurl',
  },
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  minify: !watch,
  sourcemap: watch ? 'inline' : false,
})

if (watch) {
  await ctx.watch()
  console.log('Watching for changes...')
} else {
  await ctx.rebuild()
  await ctx.dispose()
  console.log('Build complete.')
}
