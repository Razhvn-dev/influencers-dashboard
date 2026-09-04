import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const rootEnv = loadEnv(mode, '../', '');
  const shopifyApiKey =
    env.VITE_SHOPIFY_API_KEY ||
    rootEnv.SHOPIFY_API_KEY ||
    process.env.SHOPIFY_API_KEY ||
    '';
  const localDev =
    env.LOCAL_DEV || rootEnv.LOCAL_DEV || process.env.LOCAL_DEV || '';
  const apiProxyTarget =
    env.API_PROXY_TARGET ||
    rootEnv.API_PROXY_TARGET ||
    process.env.API_PROXY_TARGET ||
    'http://localhost:3000';

  return {
    build: {
      commonjsOptions: {
        include: [/lib\//, /node_modules/],
      },
    },
    resolve: {
      alias: {
        '@lib': path.resolve(__dirname, '../lib'),
      },
    },
    plugins: [
      react(),
      {
        name: 'inject-shopify-api-key',
        transformIndexHtml(html) {
          return html.replaceAll('%SHOPIFY_API_KEY%', shopifyApiKey);
        },
      },
    ],
    define: {
      'import.meta.env.VITE_SHOPIFY_API_KEY': JSON.stringify(shopifyApiKey),
      'import.meta.env.VITE_LOCAL_DEV': JSON.stringify(localDev),
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: apiProxyTarget,
          changeOrigin: true,
        },
        '/auth': {
          target: apiProxyTarget,
          changeOrigin: true,
        },
      },
    },
  };
});
