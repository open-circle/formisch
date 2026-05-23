import { ssgAdapter } from '@qwik.dev/router/adapters/ssg/vite';
import { extendConfig } from '@qwik.dev/router/vite';
import baseConfig from '../../vite.config';

export default extendConfig(
  // @ts-ignore
  baseConfig,
  () => {
    return {
      build: {
        ssr: true,
        rollupOptions: {
          input: ['src/entry.ssr.tsx'],
        },
      },
      plugins: [
        ssgAdapter({
          origin: 'https://formisch.dev',
          sitemapOutFile: null,
        }),
      ],
    };
  }
);
