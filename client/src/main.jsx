import React, { useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { AppProvider as PolarisAppProvider } from '@shopify/polaris';
import { NavMenu, useAppBridge } from '@shopify/app-bridge-react';
import enTranslations from '@shopify/polaris/locales/en.json';
import '@shopify/polaris/build/esm/styles.css';
import './styles/crm-ui.css';
import App from './App.jsx';
import { setSessionTokenFetcher } from './api.js';

function getHostFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const host = params.get('host');

  if (host) {
    window.sessionStorage.setItem('shopify-host', host);
    return host;
  }

  return window.sessionStorage.getItem('shopify-host');
}

function AuthenticatedApp({ children }) {
  const shopify = useAppBridge();

  useEffect(() => {
    setSessionTokenFetcher(() => shopify.idToken());
  }, [shopify]);

  return (
    <>
      <NavMenu>
        <a href="/" rel="home">
          Influencer Dashboard
        </a>
      </NavMenu>
      {children}
    </>
  );
}

function LocalDevApp() {
  useEffect(() => {
    setSessionTokenFetcher(async () => null);
  }, []);

  return <App embedded={false} localPreview />;
}

function ShopifyAppRoot() {
  const host = useMemo(() => getHostFromUrl(), []);
  const apiKey = import.meta.env.VITE_SHOPIFY_API_KEY;
  const isLocalDev = import.meta.env.VITE_LOCAL_DEV === 'true';

  if (isLocalDev) {
    return (
      <PolarisAppProvider i18n={enTranslations}>
        <LocalDevApp />
      </PolarisAppProvider>
    );
  }

  if (!apiKey) {
    return (
      <PolarisAppProvider i18n={enTranslations}>
        <App embedded={false} missingConfig="apiKey" />
      </PolarisAppProvider>
    );
  }

  if (!host) {
    return (
      <PolarisAppProvider i18n={enTranslations}>
        <App embedded={false} missingConfig="host" />
      </PolarisAppProvider>
    );
  }

  return (
    <PolarisAppProvider i18n={enTranslations}>
      <AuthenticatedApp>
        <App embedded />
      </AuthenticatedApp>
    </PolarisAppProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ShopifyAppRoot />
  </React.StrictMode>
);
