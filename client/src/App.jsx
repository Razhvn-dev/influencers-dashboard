import { lazy, Suspense, useMemo } from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { Banner, Layout, Page, Spinner } from '@shopify/polaris';
import { useTranslation } from './i18n/LanguageContext.jsx';

const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const AddCreatorPage = lazy(() => import('./pages/AddCreatorPage'));
const CreatorDetailPage = lazy(() => import('./pages/CreatorDetailPage'));

function PageLoadFallback() {
  const { t } = useTranslation();

  return (
    <Page fullWidth className="crm-page">
      <Layout>
        <Layout.Section>
          <div className="crm-page-loading">
            <Spinner accessibilityLabel={t('detail.loading')} size="large" />
          </div>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

function LazyPage({ children }) {
  return <Suspense fallback={<PageLoadFallback />}>{children}</Suspense>;
}

function MissingConfigPage({ missingConfig }) {
  const { t } = useTranslation();
  const title =
    missingConfig === 'apiKey' ? t('config.apiKeyTitle') : t('config.hostTitle');

  const message =
    missingConfig === 'apiKey' ? t('config.apiKeyMessage') : t('config.hostMessage');

  return (
    <Page title={t('config.title')} fullWidth className="crm-page">
      <Layout>
        <Layout.Section>
          <Banner tone="warning" title={title}>
            <p>{message}</p>
          </Banner>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

export default function App({
  missingConfig = null,
  localPreview = false,
  embedded = true,
}) {
  if (missingConfig) {
    return <MissingConfigPage missingConfig={missingConfig} />;
  }

  const router = useMemo(
    () =>
      createBrowserRouter([
        {
          path: '/',
          element: (
            <LazyPage>
              <DashboardPage localPreview={localPreview} embedded={embedded} />
            </LazyPage>
          ),
        },
        {
          path: '/creators/new',
          element: (
            <LazyPage>
              <AddCreatorPage localPreview={localPreview} embedded={embedded} />
            </LazyPage>
          ),
        },
        {
          path: '/creators/:id',
          element: (
            <LazyPage>
              <CreatorDetailPage localPreview={localPreview} embedded={embedded} />
            </LazyPage>
          ),
        },
        { path: '*', element: <Navigate to="/" replace /> },
      ]),
    [embedded, localPreview]
  );

  return <RouterProvider router={router} />;
}
