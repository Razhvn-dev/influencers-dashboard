import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Banner, Layout, Page } from '@shopify/polaris';
import DashboardPage from './pages/DashboardPage';
import AddCreatorPage from './pages/AddCreatorPage';
import CreatorDetailPage from './pages/CreatorDetailPage';

function MissingConfigPage({ missingConfig }) {
  const title =
    missingConfig === 'apiKey'
      ? 'Shopify API key is missing'
      : 'Open this app from Shopify Admin';

  const message =
    missingConfig === 'apiKey'
      ? 'Set SHOPIFY_API_KEY in your deployment environment and rebuild the frontend.'
      : 'Install the app on your Shopify store, then open it from Apps in the Shopify admin.';

  return (
    <Page title="Influencer Dashboard" fullWidth className="crm-page">
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

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<DashboardPage localPreview={localPreview} embedded={embedded} />}
        />
        <Route
          path="/creators/new"
          element={<AddCreatorPage localPreview={localPreview} embedded={embedded} />}
        />
        <Route
          path="/creators/:id"
          element={<CreatorDetailPage localPreview={localPreview} embedded={embedded} />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
