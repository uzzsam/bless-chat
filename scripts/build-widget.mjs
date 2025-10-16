import { build, context } from 'esbuild';

const isWatch = process.argv.includes('--watch');

const sharedOptions = {
  entryPoints: ['widget/src/index.ts'],
  bundle: true,
  outfile: 'public/bless-chat-widget.js',
  format: 'iife',
  globalName: 'BlessChat',
  sourcemap: true,
  minify: true,
  target: ['es2019'],
};

if (isWatch) {
  const ctx = await context(sharedOptions);
  await ctx.watch();
  console.log('Bless chat widget watcher running...');
} else {
  await build(sharedOptions);
  console.log('Bless chat widget built.');
}
