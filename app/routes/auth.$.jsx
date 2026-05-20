import { useRouteError } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";

import { SessionTokenBounceRecovery } from "../components/SessionTokenBounceRecovery";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export default function AuthRoute() {
  return null;
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
