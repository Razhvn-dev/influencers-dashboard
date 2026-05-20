import { useCallback } from "react";
import { useFetcher } from "react-router";
import { refreshSessionTokenIfPossible } from "../utils/shopify-diagnostics.client";

/**
 * useFetcher wrapper that refreshes the Shopify session token before submit.
 */
export function useShopifyFetcher() {
  const fetcher = useFetcher();

  const submit = useCallback(
    async (data, options) => {
      await refreshSessionTokenIfPossible();
      fetcher.submit(data, options);
    },
    [fetcher],
  );

  return { ...fetcher, submit };
}
