import { Outlet, useLoaderData, useRouteError, Link, useLocation } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { AppProvider } from "@shopify/shopify-app-react-router/react";
import "@shopify/polaris/build/esm/styles.css";
import { authenticate } from "../shopify.server";
import * as Polaris from "@shopify/polaris";
import enTranslations from "@shopify/polaris/locales/en.json";

const { AppProvider: PolarisAppProvider } = Polaris;

export const loader = async ({ request }) => {
  await authenticate.admin(request);

  return {
    apiKey: process.env.SHOPIFY_API_KEY || "",
  };
};

export default function App() {
  const { apiKey } = useLoaderData();
  const location = useLocation();

  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      <PolarisAppProvider i18n={enTranslations}>
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
          <nav
            style={{
              backgroundColor: "#1f2937",
              padding: "16px",
              color: "white",
            }}
          >
            <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h1 style={{ margin: 0, fontSize: "20px" }}>Influencer Management System</h1>
                <ul
                  style={{
                    listStyle: "none",
                    margin: 0,
                    padding: 0,
                    display: "flex",
                    gap: "24px",
                  }}
                >
                  <li>
                    <Link to={{ pathname: "/app", search: location.search }} style={{ textDecoration: "none", color: "white" }}>
                      Home
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </nav>
          <main
            style={{
              flex: 1,
              padding: "24px",
              maxWidth: "1200px",
              margin: "0 auto",
              width: "100%",
            }}
          >
            <Outlet />
          </main>
        </div>
      </PolarisAppProvider>
    </AppProvider>
  );
}

export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
