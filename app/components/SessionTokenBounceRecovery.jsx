import { useEffect } from "react";
import {
  BUILD_ID,
  completeSessionBounce,
  logShopifyDiagnostics,
} from "../utils/shopify-diagnostics.client";

/**
 * Client recovery when /auth/session-token loader returns App Bridge HTML via ErrorBoundary.
 */
export function SessionTokenBounceRecovery() {
  useEffect(() => {
    logShopifyDiagnostics("session-token-recovery");
    // Slight delay so root AppBridgeScript can attach shopify global
    const timer = setTimeout(() => {
      void completeSessionBounce();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ padding: 24, fontFamily: "system-ui", textAlign: "center" }}>
      <p>Refreshing Shopify session…</p>
      <p style={{ fontSize: 12, color: "#666" }}>Build: {BUILD_ID}</p>
    </div>
  );
}
