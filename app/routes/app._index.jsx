import { useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import styles from "../../app/app.influencers._index.styles.module.css";

export const loader = async ({ request }) => {
  // 开发模式下跳过认证
  const DEV_MODE = process.env.DEV_MODE === "true";
  
  if (DEV_MODE) {
    return {
      shop: "dev-shop.myshopify.com",
      timestamp: new Date().toLocaleString('en-US'),
      devMode: DEV_MODE
    };
  }
  
  const { session } = await authenticate.admin(request);
  return {
    shop: session.shop,
    timestamp: new Date().toLocaleString('en-US'),
    devMode: DEV_MODE
  };
};
export default function Index() {
  const { shop, timestamp } = useLoaderData();
  return (
    <div className={styles.pageContainer} style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <Card
          title="Creator Management"
          description="Manage influencer info, follower data, and partnership status."
          link="/app/influencers"
          icon="👥"
        />
        <Card
          title="Creator Overview"
          description="View all creator information with search, sort, and quick view features."
          link="/app/influencers/overview"
          icon="📊"
        />
      </div>
    </div>
  );
}

function Card({ title, description, link, icon }) {
  return (
    <a
      href={link}
      style={{
        display: 'block',
        padding: '16px',
        backgroundColor: 'white',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'all 0.3s ease',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div style={{ fontSize: '24px', marginBottom: '8px' }}>{icon}</div>
      <h3 style={{ margin: '0 0 8px 0', color: '#1f2937' }}>{title}</h3>
      <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
        {description}
      </p>
    </a>
  );
}
