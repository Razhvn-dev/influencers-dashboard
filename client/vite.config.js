import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const rootEnv = loadEnv(mode, '../', '');
  const shopifyApiKey =
    env.VITE_SHOPIFY_API_KEY ||
    rootEnv.SHOPIFY_API_KEY ||
    process.env.SHOPIFY_API_KEY ||
    '';

  return {
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
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
        '/auth': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
      },
    },
  };
});
