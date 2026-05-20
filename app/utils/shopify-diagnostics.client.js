import { BUILD_ID } from "../build-info.js";

export { BUILD_ID };

const APP_BRIDGE_POLL_MS = 100;
const APP_BRIDGE_MAX_WAIT_MS = 8000;

/**
 * Logs deployment marker + App Bridge / embedded state (client only).
 * @param {string | Record<string, unknown>} context
 */
export function logShopifyDiagnostics(context = "app") {
  if (typeof window === "undefined") return;

  const payload =
    typeof context === "string"
      ? { context }
      : { ...context };

  const shopify = window.shopify;
  const hasIdToken = typeof shopify?.idToken === "function";

  console.info("[Influencer App] Shopify session fix active", {
    buildId: BUILD_ID,
    ...payload,
    path: window.location.pathname,
    search: window.location.search,
    embedded: new URLSearchParams(window.location.search).get("embedded") === "1",
    appBridgeLoaded: Boolean(shopify),
    idTokenAvailable: hasIdToken,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Wait for App Bridge global (admin may inject it, or root AppBridgeScript loads it).
 */
export async function waitForAppBridge() {
  if (typeof window === "undefined") return null;

  const deadline = Date.now() + APP_BRIDGE_MAX_WAIT_MS;
  while (Date.now() < deadline) {
    if (typeof window.shopify?.idToken === "function") {
      return window.shopify;
    }
    await new Promise((resolve) => setTimeout(resolve, APP_BRIDGE_POLL_MS));
  }

  return window.shopify ?? null;
}

/**
 * Refreshes session token when App Bridge is available (no-op otherwise).
 */
export async function refreshSessionTokenIfPossible() {
  if (typeof window === "undefined") return false;

  const shopify = await waitForAppBridge();
  if (typeof shopify?.idToken !== "function") {
    console.warn("[Influencer App] App Bridge idToken() not available after wait");
    return false;
  }

  try {
    await shopify.idToken();
    console.debug("[Influencer App] Session token refreshed via idToken()");
    return true;
  } catch (error) {
    console.warn("[Influencer App] idToken() failed", error);
    return false;
  }
}

/**
 * Completes bounce from /auth/session-token back to the app.
 * @param {string | null | undefined} reloadUrl
 */
export async function completeSessionBounce(reloadUrl) {
  if (typeof window === "undefined") return;

  const target =
    reloadUrl ||
    new URLSearchParams(window.location.search).get("shopify-reload") ||
    "/app";

  logShopifyDiagnostics({ context: "session-bounce", target });

  await refreshSessionTokenIfPossible();

  try {
    const resolved = new URL(target, window.location.origin).toString();
    window.location.replace(resolved);
  } catch {
    window.location.replace(target);
  }
}
