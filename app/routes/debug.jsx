import { useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const loader = async ({ request }) => {
  try {
    const { session } = await authenticate.admin(request);
    
    // 检查数据库中的会话
    const dbSession = await prisma.session.findFirst({
      where: { shop: session.shop }
    });

    return {
      sessionValid: !!session,
      shop: session.shop,
      dbSessionExists: !!dbSession,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

export default function Debug() {
  const data = useLoaderData();

  return (
    <div style={{ padding: '24px', fontFamily: 'monospace' }}>
      <h1>调试信息</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
