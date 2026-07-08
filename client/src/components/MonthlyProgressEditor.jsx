import {
  BlockStack,
  Box,
  Button,
  DataTable,
  InlineStack,
  Text,
  TextField,
} from '@shopify/polaris';
import { MONTHLY_PERIOD_LABELS } from '../constants';
import UrlFieldWithOpen from './UrlFieldWithOpen';

export default function MonthlyProgressEditor({ periods, onChange, disabled = false, embedded = false }) {
  const updatePeriod = (periodIndex, field) => (value) => {
    onChange(
      periods.map((period) =>
        period.period_index === periodIndex
          ? { ...period, [field]: value }
          : period
      )
    );
  };

  const clearPeriod = (periodIndex) => {
    onChange(
      periods.map((period) =>
        period.period_index === periodIndex
          ? {
              ...period,
              monthly_check_in: '',
              content_delivered: '',
              link: '',
            }
          : period
      )
    );
  };

  const rows = periods.map((period) => [
    MONTHLY_PERIOD_LABELS[period.period_index - 1] || `Period ${period.period_index}`,
    <TextField
      label={`Monthly Check-In (${period.period_index})`}
      labelHidden
      value={period.monthly_check_in}
      onChange={updatePeriod(period.period_index, 'monthly_check_in')}
      placeholder="YES / NO"
      autoComplete="off"
      disabled={disabled}
    />,
    <TextField
      label={`Content Delivered (${period.period_index})`}
      labelHidden
      value={period.content_delivered}
      onChange={updatePeriod(period.period_index, 'content_delivered')}
      placeholder="Describe delivered content"
      autoComplete="off"
      disabled={disabled}
    />,
    <UrlFieldWithOpen
      label={`Link (${period.period_index})`}
      labelHidden
      value={period.link}
      onChange={updatePeriod(period.period_index, 'link')}
      placeholder="https://..."
      disabled={disabled}
    />,
    <InlineStack align="end">
      <Button
        variant="plain"
        tone="critical"
        disabled={disabled}
        onClick={() => clearPeriod(period.period_index)}
      >
        Clear
      </Button>
    </InlineStack>,
  ]);

  return (
    <BlockStack gap="300">
      {embedded ? null : (
        <BlockStack gap="100">
          <Text as="h3" variant="headingMd">
            Monthly Progress
          </Text>
          <Text as="p" tone="subdued" variant="bodySm">
            Fixed 5 contract periods (matches the sponsorship spreadsheet). Edit each row
            directly — there is no add/delete row. Use Clear to reset a period, then save.
          </Text>
        </BlockStack>
      )}
      <Box overflowX="auto" className={embedded ? 'crm-progress-edit-table' : undefined}>
        <DataTable
          columnContentTypes={['text', 'text', 'text', 'text', 'text']}
          headings={[
            'Period',
            'Monthly Check-In',
            'Content Delivered',
            'Link',
            'Actions',
          ]}
          rows={rows}
        />
      </Box>
    </BlockStack>
  );
}
