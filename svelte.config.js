import adapter from '@sveltejs/adapter-static'
import preprocess from 'svelte-preprocess'

const production = process.env.NODE_ENV === 'production'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: preprocess(),
  kit: {
    adapter: adapter(),
    serviceWorker: {
      register: false
    }
    // paths: {
    // 	base: production ? '/website' : ''
    // }
  }
}

export default config
