import { Box, InlineStack, Pagination, Text } from '@shopify/polaris';
import ToolbarPopoverSelect from '../dashboard/ToolbarPopoverSelect';

export default function CreatorListPagination({ className = '', paginationLabel, page, totalPages, onPrevious, onNext, pageSize, pageSizeOptions, onPageSizeChange, perPageLabel }) {
  return (
    <Box className={`crm-creator-list__pagination ${className}`.trim()}>
      <InlineStack align="space-between" blockAlign="center" wrap gap="400">
        <Text as="p" tone="subdued" variant="bodySm">{paginationLabel}</Text>
        <Pagination hasPrevious={page > 1} onPrevious={onPrevious} hasNext={page < totalPages} onNext={onNext} />
        <Box className="crm-v2-table__page-size">
          <ToolbarPopoverSelect label={perPageLabel} labelHidden compact options={pageSizeOptions} value={String(pageSize)} onChange={onPageSizeChange} />
        </Box>
      </InlineStack>
    </Box>
  );
}
