import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from "react-router";

import { AppBridgeScript } from "./components/AppBridgeScript";
import { ShopifySessionGuard } from "./components/ShopifySessionGuard";

export async function loader() {
  return {
    apiKey: process.env.SHOPIFY_API_KEY || "",
  };
}

export function Layout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="preconnect" href="https://cdn.shopify.com/" />
        <link
          rel="stylesheet"
          href="https://cdn.shopify.com/static/fonts/inter/v4/styles.css"
        />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ShopifySessionGuard />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const { apiKey } = useLoaderData();

  return (
    <>
      <AppBridgeScript apiKey={apiKey} />
      <Outlet />
    </>
  );
}
