import { Outlet, useLoaderData, useRouteError, Link } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { AppProvider } from "@shopify/shopify-app-react-router/react";
import "@shopify/polaris/build/esm/styles.css"; // ✅ 导入 Polaris 样式
import { authenticate } from "../shopify.server";
import * as Polaris from "@shopify/polaris";
import enTranslations from "@shopify/polaris/locales/en.json";

const { AppProvider: PolarisAppProvider } = Polaris;

// 开发模式：跳过认证（只在服务端执行）
const DEV_MODE = process.env.DEV_MODE === "true";

export const loader = async ({ request }) => {
  // 开发模式下跳过认证
  if (!DEV_MODE) {
    await authenticate.admin(request);
  }
  return { 
    apiKey: process.env.SHOPIFY_API_KEY || "",
    devMode: DEV_MODE
  };
};

export default function App() {
  const { apiKey, devMode } = useLoaderData();

  return (
    <AppProvider isEmbeddedApp={!devMode} apiKey={apiKey}>
      <PolarisAppProvider i18n={enTranslations}>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <nav style={{
            backgroundColor: '#1f2937',
            padding: '16px',
            color: 'white'
          }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ margin: 0, fontSize: '20px' }}>Influencer Management System {devMode && '(Dev Mode)'}</h1>
              <ul style={{
                listStyle: 'none',
                  margin: 0,
                padding: 0,
                display: 'flex',
                  gap: '24px'
              }}>
                  <li><Link to="/app" style={{ textDecoration: 'none', color: 'white' }}>Home</Link></li>
                  {!devMode && (
                    <li><Link to="/auth/login" style={{ textDecoration: 'none', color: '#fbbf24' }}>Switch Shop</Link></li>
                  )}
              </ul>
            </div>
        </div>
          </nav>
          <main style={{ flex: 1, padding: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
            <Outlet />
          </main>
        </div>
      </PolarisAppProvider>
    </AppProvider>
  );
}

// Shopify needs React Router to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};