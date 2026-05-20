import { useEffect } from "react";
import { useLoaderData, useRouteError } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";

import { SessionTokenBounceRecovery } from "../components/SessionTokenBounceRecovery";
import {
  BUILD_ID,
  completeSessionBounce,
  logShopifyDiagnostics,
} from "../utils/shopify-diagnostics.client";

/**
 * Do NOT call authenticate.admin here — it throws App Bridge HTML and breaks RR client routing.
 * This route only completes the bounce back to shopify-reload.
 */
export const loader = async ({ request }) => {
  const url = new URL(request.url);

  return {
    buildId: BUILD_ID,
    apiKey: process.env.SHOPIFY_API_KEY || "",
    reloadUrl: url.searchParams.get("shopify-reload"),
  };
};

export default function AuthSessionToken() {
  const data = useLoaderData();

  useEffect(() => {
    logShopifyDiagnostics({
      context: "session-token-route",
      reloadUrl: data?.reloadUrl,
    });
    void completeSessionBounce(data?.reloadUrl);
  }, [data?.reloadUrl]);

  return (
    <div style={{ padding: 24, fontFamily: "system-ui", textAlign: "center" }}>
      <p>Refreshing Shopify session…</p>
      <p style={{ fontSize: 12, color: "#666" }}>Build: {BUILD_ID}</p>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const isHtmlBounce =
    error &&
    typeof error === "object" &&
    "data" in error &&
    typeof error.data === "string" &&
    error.data.includes("app-bridge");

  if (isHtmlBounce) {
    return <SessionTokenBounceRecovery />;
  }

  return boundary.error(error);
}

export const headers = (headersArgs) => boundary.headers(headersArgs);
