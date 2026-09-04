import React, { useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { AppProvider as PolarisAppProvider } from '@shopify/polaris';
import { NavMenu, useAppBridge } from '@shopify/app-bridge-react';
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

function getHostFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const host = params.get('host');

  if (host) {
    window.sessionStorage.setItem('shopify-host', host);
    return host;
  }

  return window.sessionStorage.getItem('shopify-host');
}

function PolarisLocaleProvider({ children }) {
  const { locale } = useTranslation();
  const polarisI18n = locale === 'zh' ? zhTranslations : enTranslations;

  return <PolarisAppProvider i18n={polarisI18n}>{children}</PolarisAppProvider>;
}

function AuthenticatedApp({ children }) {
  const shopify = useAppBridge();
  const { t } = useTranslation();

  useEffect(() => {
    setSessionTokenFetcher(() => shopify.idToken());
  }, [shopify]);

  return (
    <>
      <NavMenu>
        <a href="/" rel="home">
          {t('nav.appName')}
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
