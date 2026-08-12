import { Box, Card } from '@shopify/polaris';

export default function CreatorListContent({ itemCount, children }) {
  return (
    <section
      className="crm-creator-list__content"
      aria-label="Creator resource list"
      data-record-count={itemCount}
    >
      <Card padding="0">{children}</Card>
    </section>
  );
}
