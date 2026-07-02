import {
  BlockStack,
  Box,
  DataTable,
  Text,
  TextField,
} from '@shopify/polaris';
import { MONTHLY_PERIOD_LABELS } from '../constants';

export default function MonthlyProgressEditor({ periods, onChange, disabled = false }) {
  const updatePeriod = (periodIndex, field) => (value) => {
    onChange(
      periods.map((period) =>
        period.period_index === periodIndex
          ? { ...period, [field]: value }
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
      autoComplete="off"
      disabled={disabled}
    />,
    <TextField
      label={`Content Delivered (${period.period_index})`}
      labelHidden
      value={period.content_delivered}
      onChange={updatePeriod(period.period_index, 'content_delivered')}
      autoComplete="off"
      disabled={disabled}
    />,
    <TextField
      label={`Link (${period.period_index})`}
      labelHidden
      value={period.link}
      onChange={updatePeriod(period.period_index, 'link')}
      autoComplete="off"
      disabled={disabled}
    />,
  ]);

  return (
    <BlockStack gap="300">
      <Text as="h3" variant="headingMd">
        Monthly Progress
      </Text>
      <Box overflowX="scroll">
        <DataTable
          columnContentTypes={['text', 'text', 'text', 'text']}
          headings={['Period', 'Monthly Check-In', 'Content Delivered', 'Link']}
          rows={rows}
        />
      </Box>
    </BlockStack>
  );
}
