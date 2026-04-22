import { login } from "../shopify.server";

export const loader = async ({ request }) => {
  return await login(request);
};
