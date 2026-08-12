// Vite is the local visual-QA surface; CI or an ephemeral environment can
// override the page origin through BASE_URL.
export const baseUrl = (process.env.BASE_URL || 'http://localhost:5173').replace(/\/$/, '');

export const chromePath =
  process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
