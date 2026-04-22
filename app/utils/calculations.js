/**
 * Calculate Ambassador Level
 * Automatically determine level based on total followers and YouTube subscribers
 * 
 * Ambassador 1: Total followers >= 100,000 and YouTube >= 50,000
 * Ambassador 2: Total followers >= 50,000 and YouTube >= 20,000
 * Ambassador 3: Total followers >= 10,000 and YouTube >= 5,000
 */
export function calculateAmbassadorLevel(influencer) {
  const totalFollowers = 
    (influencer.youtubeFollowers || 0) +
    (influencer.facebookFollowers || 0) +
    (influencer.instagramFollowers || 0) +
    (influencer.tiktokFollowers || 0);

  const youtubeFollowers = influencer.youtubeFollowers || 0;

  if (totalFollowers >= 100000 && youtubeFollowers >= 50000) {
    return 'AMBASSADOR_1';
  } else if (totalFollowers >= 50000 && youtubeFollowers >= 20000) {
    return 'AMBASSADOR_2';
  } else if (totalFollowers >= 10000 && youtubeFollowers >= 5000) {
    return 'AMBASSADOR_3';
  } else {
    return 'NONE';
  }
}

/**
 * Calculate total followers
 */
export function calculateTotalFollowers(influencer) {
  return (
    (influencer.youtubeFollowers || 0) +
    (influencer.facebookFollowers || 0) +
    (influencer.instagramFollowers || 0) +
    (influencer.tiktokFollowers || 0)
  );
}

/**
 * Format number to readable format
 */
export function formatFollowers(count) {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + 'M';
  } else if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'K';
  }
  return count.toString();
}

/**
 * Get collaboration status label color
 */
export function getStatusColor(status) {
  const statusColors = {
    'Not Applied': 'gray',
    'Applied': 'blue',
    'Contacted': 'cyan',
    'Call Scheduled': 'purple',
    'Under Review': 'orange',
    'Approved': 'green',
    'Rejected': 'red',
    'Active Partner': 'lime',
    'Past Partner': 'slate'
  };
  return statusColors[status] || 'gray';
}