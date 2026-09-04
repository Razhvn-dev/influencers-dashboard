import React, { useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { AppProvider as PolarisAppProvider } from '@shopify/polaris';
import enTranslations from '@shopify/polaris/locales/en.json';
import zhTranslations from '@shopify/polaris/locales/zh-CN.json';
import '@shopify/polaris/build/esm/styles.css';
import './styles/crm-ui.css';
import './styles/crm-dashboard.css';
import './styles/add-creator.css';
import './styles/creator-detail.css';
import App from './App.jsx';
import { setSessionTokenFetcher } from './api.js';
import { LanguageProvider, useTranslation } from './i18n/LanguageContext.jsx';

// This revision intentionally changes the hashed Vite entry after a corrected
// asset response was previously cached by browsers as immutable.
window.__INFLUENCER_ASSET_REVISION__ = 'mime-cache-bust-5d09aa1';

let initialShopifySessionToken = null;

function getHostFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const host = params.get('host');

  if (host) {
    window.sessionStorage.setItem('shopify-host', host);
    return host;
  }

  return window.sessionStorage.getItem('shopify-host');
}

function getSessionTokenFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('id_token');

  if (token) {
    initialShopifySessionToken = token;
  }

  return initialShopifySessionToken;
}

function PolarisLocaleProvider({ children }) {
  const { locale } = useTranslation();
  const polarisI18n = locale === 'zh' ? zhTranslations : enTranslations;

  return <PolarisAppProvider i18n={polarisI18n}>{children}</PolarisAppProvider>;
}

function AuthenticatedApp({ children }) {
  useEffect(() => {
    setSessionTokenFetcher(async () => {
      if (typeof window.shopify?.idToken === 'function') {
        return window.shopify.idToken();
      }

      const token = getSessionTokenFromUrl();
      if (token) return token;

      throw new Error('Shopify session token is unavailable. Please refresh the page and try again.');
    });
  }, []);

  return children;
}

function LocalDevApp() {
  useEffect(() => {
    setSessionTokenFetcher(async () => null);
  }, []);

  return <App embedded={false} localPreview />;
}

function ShopifyAppRoot() {
  const host = useMemo(() => getHostFromUrl(), []);
  const apiKey =
    document.querySelector('meta[name="shopify-api-key"]')?.getAttribute('content') ||
    import.meta.env.VITE_SHOPIFY_API_KEY;
  const isLocalDev = import.meta.env.VITE_LOCAL_DEV === 'true';

  if (isLocalDev) {
    return (
      <LanguageProvider>
        <PolarisLocaleProvider>
          <LocalDevApp />
        </PolarisLocaleProvider>
      </LanguageProvider>
    );
  }

  if (!apiKey) {
    return (
      <LanguageProvider>
        <PolarisLocaleProvider>
          <App embedded={false} missingConfig="apiKey" />
        </PolarisLocaleProvider>
      </LanguageProvider>
    );
  }

  if (!host) {
    return (
      <LanguageProvider>
        <PolarisLocaleProvider>
          <App embedded={false} missingConfig="host" />
        </PolarisLocaleProvider>
      </LanguageProvider>
    );
  }

  return (
    <LanguageProvider>
      <PolarisLocaleProvider>
        <AuthenticatedApp>
          <App embedded />
        </AuthenticatedApp>
      </PolarisLocaleProvider>
    </LanguageProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ShopifyAppRoot />
  </React.StrictMode>
);
