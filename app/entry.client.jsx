import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";

import { BUILD_ID } from "./utils/shopify-diagnostics.client";

if (typeof window !== "undefined") {
  console.info("[Influencer App] Client bundle loaded", {
    buildId: BUILD_ID,
    path: window.location.pathname,
  });
}

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <HydratedRouter />
    </StrictMode>,
  );
});
