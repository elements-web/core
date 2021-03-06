import { resolve } from 'path'
import { fileURLToPath } from 'url'

/**
 * @type { import('vite').UserConfig }
 */
const config = {
	esbuild: {
		jsxFactory: 'h',
		jsxFragment: 'Fragment',
		jsxInject: `import { h, Fragment } from 'preact'`
	},
	css: {
		modules: {
			scopeBehaviour: 'local',
			localsConvention: 'camelCaseOnly',
		},
	},
	resolve: {
		alias: {
			// @ts-ignore
			'@': resolve(fileURLToPath(import.meta.url), '..', 'src'),
		},
	},
}

export default config
