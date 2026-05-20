import { BUILD_ID, ENTRYPOINT_VERSION } from "../build-info.js";

/**
 * GET /health — open in browser to verify which build is running on Sealos.
 * Example: https://iuwtkeqiodjw.sealoshzh.site/health
 */
export async function loader() {
  return Response.json(
    {
      ok: true,
      buildId: BUILD_ID,
      entrypointVersion: ENTRYPOINT_VERSION,
      nodeEnv: process.env.NODE_ENV ?? "unknown",
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "application/json",
      },
    },
  );
}
