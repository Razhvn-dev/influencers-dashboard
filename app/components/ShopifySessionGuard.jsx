import { useEffect, useRef } from "react";
import { useLocation } from "react-router";

import {
  completeSessionBounce,
  logShopifyDiagnostics,
} from "../utils/shopify-diagnostics.client";

const SESSION_TOKEN_PATH = "/auth/session-token";

/**
 * Global guard: handles SPA landings on session-token bounce + one-time deploy log.
 */
export function ShopifySessionGuard() {
  const location = useLocation();
  const hasLoggedDeploy = useRef(false);

  useEffect(() => {
    if (!hasLoggedDeploy.current) {
      hasLoggedDeploy.current = true;
      logShopifyDiagnostics("app-mounted");
    }
  }, []);

  useEffect(() => {
    if (!location.pathname.endsWith(SESSION_TOKEN_PATH)) return;

    logShopifyDiagnostics({
      context: "session-guard",
      pathname: location.pathname,
    });
    void completeSessionBounce();
  }, [location.pathname, location.search]);

  return null;
}
