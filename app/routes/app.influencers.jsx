import { Outlet } from 'react-router';

// This is the layout file for the Influencers module
// All /app/influencers/* child routes will be rendered here
export default function InfluencersLayout() {
  return (
    <div>
      <Outlet />
    </div>
  );
}