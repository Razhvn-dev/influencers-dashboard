import { formatFollowers } from '../utils/calculations';

export function InfluencerDetails({ influencer }) {
  return (
    <div style={{ maxWidth: '1200px' }}>
      {/* Basic Info Card */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <DetailCard icon="👤" label="Name" value={influencer.name} />
        <DetailCard icon="🏢" label="Company/Channel" value={influencer.company} />
        <DetailCard icon="📧" label="Email" value={influencer.email} />
        <DetailCard icon="🌍" label="Region" value={influencer.location} />
      </div>

      {/* Follower Data Card */}
      <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Follower Data</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '12px'
        }}>
          <PlatformFollowers platform="YouTube" url={influencer.youtubeUrl} followers={influencer.youtubeFollowers} />
          <PlatformFollowers platform="Facebook" url={influencer.facebookUrl} followers={influencer.facebookFollowers} />
          <PlatformFollowers platform="Instagram" url={influencer.instagramUrl} followers={influencer.instagramFollowers} />
          <PlatformFollowers platform="TikTok" url={influencer.tiktokUrl} followers={influencer.tiktokFollowers} />
        </div>
        <div style={{
          marginTop: '16px',
          padding: '12px',
          backgroundColor: 'white',
          borderRadius: '4px',
          border: '2px solid #0066cc'
        }}>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
            Total Followers
          </div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#0066cc' }}>
            {formatFollowers(influencer.totalFollowers)}
          </div>
        </div>
      </div>

      {/* Ambassador Level & Collaboration Status */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{
          padding: '16px',
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
            Ambassador Level
          </div>
          <div style={{
            display: 'inline-block',
            padding: '8px 16px',
            backgroundColor: getLevelColor(influencer.ambassadorLevel),
            color: 'white',
            borderRadius: '4px',
            fontWeight: '600',
            fontSize: '16px'
          }}>
            Level {influencer.ambassadorLevel}
          </div>
        </div>

        <div style={{
          padding: '16px',
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
            Collaboration Status
          </div>
          <div style={{
            display: 'inline-block',
            padding: '8px 16px',
            backgroundColor: getStatusBgColor(influencer.collaborationStatus),
            color: 'white',
            borderRadius: '4px',
            fontWeight: '600'
          }}>
            {influencer.collaborationStatus}
          </div>
        </div>
      </div>

      {/* CRM Info */}
      {(influencer.notes || influencer.contractStatus || influencer.productsOffered || influencer.deliverables) && (
        <div style={{
          padding: '16px',
          backgroundColor: '#fef3c7',
          borderRadius: '8px',
          border: '1px solid #fcd34d',
          marginBottom: '24px'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '12px' }}>CRM Info</h3>
          {influencer.notes && (
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '12px', color: '#92400e', fontWeight: '600', marginBottom: '4px' }}>
                Communication Notes
              </div>
              <div style={{ color: '#78350f' }}>
                {influencer.notes}
              </div>
            </div>
          )}
          {influencer.contractStatus && (
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '12px', color: '#92400e', fontWeight: '600', marginBottom: '4px' }}>
                Contract Status
              </div>
              <div style={{ color: '#78350f' }}>
                {influencer.contractStatus}
              </div>
            </div>
          )}
          {influencer.productsOffered && (
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '12px', color: '#92400e', fontWeight: '600', marginBottom: '4px' }}>
                Promised Products
              </div>
              <div style={{ color: '#78350f' }}>
                {influencer.productsOffered}
              </div>
            </div>
          )}
          {influencer.deliverables && (
            <div>
              <div style={{ fontSize: '12px', color: '#92400e', fontWeight: '600', marginBottom: '4px' }}>
                Deliverables
              </div>
              <div style={{ color: '#78350f' }}>
                {influencer.deliverables}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Follow-up Info */}
      {(influencer.lastContactDate || influencer.nextFollowUpDate || influencer.specialRequirements) && (
        <div style={{
          padding: '16px',
          backgroundColor: '#dbeafe',
          borderRadius: '8px',
          border: '1px solid #93c5fd',
          marginBottom: '24px'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '12px' }}>Follow-up Info</h3>
          {influencer.lastContactDate && (
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '12px', color: '#1e40af', fontWeight: '600', marginBottom: '4px' }}>
                Last Contact
              </div>
              <div style={{ color: '#1e3a8a' }}>
                {new Date(influencer.lastContactDate).toLocaleString('en-US')}
              </div>
            </div>
          )}
          {influencer.nextFollowUpDate && (
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '12px', color: '#1e40af', fontWeight: '600', marginBottom: '4px' }}>
                Next Follow-up
              </div>
              <div style={{ color: '#1e3a8a' }}>
                {new Date(influencer.nextFollowUpDate).toLocaleString('en-US')}
              </div>
            </div>
          )}
          {influencer.specialRequirements && (
            <div>
              <div style={{ fontSize: '12px', color: '#1e40af', fontWeight: '600', marginBottom: '4px' }}>
                Special Requirements
              </div>
              <div style={{ color: '#1e3a8a' }}>
                {influencer.specialRequirements}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Social Media Links */}
      <div style={{
        padding: '16px',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '12px' }}>Social Media Links</h3>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {influencer.youtubeUrl && (
            <a
              href={influencer.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '8px 12px',
                backgroundColor: '#ef4444',
                color: 'white',
                borderRadius: '4px',
                textDecoration: 'none'
              }}
            >
              YouTube
            </a>
          )}
          {influencer.facebookUrl && (
            <a
              href={influencer.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '8px 12px',
                backgroundColor: '#3b5998',
                color: 'white',
                borderRadius: '4px',
                textDecoration: 'none'
              }}
            >
              Facebook
            </a>
          )}
          {influencer.instagramUrl && (
            <a
              href={influencer.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '8px 12px',
                backgroundColor: '#e1306c',
                color: 'white',
                borderRadius: '4px',
                textDecoration: 'none'
              }}
            >
              Instagram
            </a>
          )}
          {influencer.tiktokUrl && (
            <a
              href={influencer.tiktokUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '8px 12px',
                backgroundColor: '#000000',
                color: 'white',
                borderRadius: '4px',
                textDecoration: 'none'
              }}
            >
              TikTok
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailCard({ icon, label, value }) {
  return (
    <div style={{
      padding: '16px',
      backgroundColor: '#f9fafb',
      borderRadius: '8px',
      border: '1px solid #e5e7eb'
    }}>
      <div style={{ fontSize: '20px', marginBottom: '4px' }}>{icon}</div>
      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
        {label}
      </div>
      <div style={{ fontSize: '14px', fontWeight: '500', wordBreak: 'break-all' }}>
        {value}
      </div>
    </div>
  );
}

function PlatformFollowers({ platform, url, followers }) {
  return (
    <div style={{
      padding: '12px',
      backgroundColor: 'white',
      borderRadius: '4px',
      border: '1px solid #e5e7eb',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
        {platform}
      </div>
      <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>
        {formatFollowers(followers)}
      </div>
      {url && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: '11px',
            color: '#0066cc',
            textDecoration: 'none'
          }}
        >
          Visit
        </a>
      )}
    </div>
  );
}

function getLevelColor(level) {
  switch (level) {
    case 3:
      return '#fbbf24';
    case 2:
      return '#60a5fa';
    default:
      return '#9ca3af';
  }
}

function getStatusBgColor(status) {
  const colors = {
    'Not Applied': '#9ca3af',
    'Applied': '#3b82f6',
    'Contacted': '#06b6d4',
    'Call Scheduled': '#a855f7',
    'Under Review': '#f97316',
    'Approved': '#10b981',
    'Rejected': '#ef4444',
    'Active Partner': '#84cc16',
    'Past Partner': '#64748b'
  };
  return colors[status] || '#9ca3af';
}
