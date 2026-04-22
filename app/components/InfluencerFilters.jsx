import { Form } from 'react-router';

export function InfluencerFilters() {
  return (
    <Form method="get" style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '12px',
      marginBottom: '24px',
      padding: '16px',
      backgroundColor: '#f9fafb',
      borderRadius: '8px'
    }}>
      <div>
        <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
          Search
        </label>
        <input
          type="text"
          name="search"
          placeholder="Name, company or email"
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
          Collaboration Status
        </label>
        <select
          name="status"
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        >
          <option value="">All</option>
          <option value="Not Applied">Not Applied</option>
          <option value="Applied">Applied</option>
          <option value="Contacted">Contacted</option>
          <option value="Call Scheduled">Call Scheduled</option>
          <option value="Under Review">Under Review</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
          <option value="Active Ambassador">Active Ambassador</option>
          <option value="Past Partner">Past Partner</option>
        </select>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
          Ambassador Level
        </label>
        <select
          name="ambassadorLevel"
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        >
          <option value="">All</option>
          <option value="1">Level 1</option>
          <option value="2">Level 2</option>
          <option value="3">Level 3</option>
        </select>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
          Region
        </label>
        <input
          type="text"
          name="location"
          placeholder="e.g., China"
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
          Minimum Followers
        </label>
        <input
          type="number"
          name="minFollowers"
          placeholder="e.g., 10,000"
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
        <button
          type="submit"
          style={{
            padding: '8px 16px',
            backgroundColor: '#0066cc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          Filter
        </button>
        <button
          type="reset"
          style={{
            padding: '8px 16px',
            backgroundColor: '#e5e7eb',
            color: '#1f2937',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Reset
        </button>
      </div>
    </Form>
  );
}
