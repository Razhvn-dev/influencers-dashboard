import "@shopify/shopify-app-react-router/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
} from "@shopify/shopify-app-react-router/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import prisma from "./db.server";

// 开发模式：跳过 Shopify 认证
const DEV_MODE = process.env.DEV_MODE === "true";

// 开发模式下的模拟认证函数
async function devAuthenticateAdmin() {
  return {
    session: {
      shop: "dev-shop.myshopify.com",
      accessToken: "dev-token",
    },
  };
}

// 生产模式下的 shopify 实例
const shopify = !DEV_MODE
  ? shopifyApp({
      apiKey: process.env.SHOPIFY_API_KEY,
      apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
      apiVersion: ApiVersion.October25,
      scopes: process.env.SCOPES?.split(","),
      appUrl: process.env.SHOPIFY_APP_URL || "",
      authPathPrefix: "/auth",
      sessionStorage: new PrismaSessionStorage(prisma),
      distribution: AppDistribution.AppStore,
      future: {
        expiringOfflineAccessTokens: true,
      },
      ...(process.env.SHOP_CUSTOM_DOMAIN
        ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
        : {}),
    })
  : null;

export default shopify;
export const apiVersion = ApiVersion.October25;

// 根据模式导出不同的认证函数
export const addDocumentResponseHeaders = DEV_MODE
  ? () => {}
  : shopify.addDocumentResponseHeaders;

export const authenticate = {
  admin: DEV_MODE ? devAuthenticateAdmin : shopify.authenticate.admin,
};

export const unauthenticated = DEV_MODE ? {} : shopify.unauthenticated;
export const login = DEV_MODE ? async () => null : shopify.login;
export const registerWebhooks = DEV_MODE ? async () => {} : shopify.registerWebhooks;
export const sessionStorage = DEV_MODE ? null : shopify.sessionStorage;
