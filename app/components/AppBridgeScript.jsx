import { useEffect, useRef } from "react";

const APP_BRIDGE_SRC = "https://cdn.shopify.com/shopifycloud/app-bridge.js";

/**
 * Ensures App Bridge is loaded on every route (including /auth/session-token).
 */
export function AppBridgeScript({ apiKey }) {
  const injected = useRef(false);

  useEffect(() => {
    if (!apiKey || injected.current || typeof window === "undefined") return;
    if (window.shopify) {
      injected.current = true;
      return;
    }

    const existing = document.querySelector(`script[src="${APP_BRIDGE_SRC}"]`);
    if (existing) {
      injected.current = true;
      return;
    }

    const script = document.createElement("script");
    script.src = APP_BRIDGE_SRC;
    script.dataset.apiKey = apiKey;
    script.async = true;
    script.onload = () => {
      injected.current = true;
      console.debug("[Influencer App] App Bridge script loaded");
    };
    script.onerror = () => {
      console.warn("[Influencer App] App Bridge script failed to load");
    };
    document.head.appendChild(script);
    injected.current = true;
  }, [apiKey]);

  return null;
}
