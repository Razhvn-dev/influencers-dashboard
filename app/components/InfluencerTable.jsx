import { Link } from 'react-router';
import { formatFollowers } from '../utils/calculations';

export function InfluencerTable({ influencers, onDelete }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '14px'
      }}>
        <thead style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
          <tr>
            <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Name</th>
            <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Company/Channel</th>
            <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Total Followers</th>
            <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Ambassador Level</th>
            <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Collaboration Status</th>
            <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {influencers.map((influencer) => (
            <tr key={influencer.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '12px' }}>
                <Link to={`/app/influencers/${influencer.id}`} style={{ color: '#0066cc', textDecoration: 'none' }}>
                  {influencer.name}
                </Link>
              </td>
              <td style={{ padding: '12px' }}>{influencer.company}</td>
              <td style={{ padding: '12px' }}>{formatFollowers(influencer.totalFollowers)}</td>
              <td style={{ padding: '12px' }}>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  backgroundColor: getLevelColor(influencer.ambassadorLevel),
                  color: 'white'
                }}>
                  Level {influencer.ambassadorLevel}
                </span>
              </td>
              <td style={{ padding: '12px' }}>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  backgroundColor: getStatusBgColor(influencer.collaborationStatus),
                  color: 'white'
                }}>
                  {influencer.collaborationStatus}
                </span>
              </td>
              <td style={{ padding: '12px' }}>
                <Link to={`/app/influencers/${influencer.id}`} style={{ marginRight: '8px', color: '#0066cc' }}>
                  Edit
                </Link>
                <button
                  onClick={() => onDelete(influencer.id)}
                  style={{
                    padding: '4px 8px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
    'Active Ambassador': '#84cc16',
    'Past Partner': '#64748b'
  };
  return colors[status] || '#9ca3af';
}
