import { defineConfig } from 'vite';

export default defineConfig({
	build: {
		target: 'ESNext',
		lib: {
			formats: ['es'],
			fileName: () => `flower-card.js`,
			entry: 'src/index.ts',
		},
		minify: true,
		sourcemap: false,
	}
});
