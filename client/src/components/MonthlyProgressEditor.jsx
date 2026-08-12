import {
  BlockStack,
  Box,
  Button,
  DataTable,
  InlineStack,
  Select,
  Text,
  TextField,
} from '@shopify/polaris';
import { MONTHLY_PERIOD_LABELS } from '../constants';
import UrlFieldWithOpen from './UrlFieldWithOpen';
import { useTranslation } from '../i18n/LanguageContext.jsx';

const MONTHLY_CHECKIN_OPTIONS = [
  { label: '—', value: '' },
  { label: 'Yes', value: 'YES' },
  { label: 'No', value: 'NO' },
  { label: 'Pending', value: 'Pending' },
];

const MONTHLY_CHECKIN_YES_NO_OPTIONS = [
  { label: '—', value: '' },
  { label: 'YES', value: 'YES' },
  { label: 'NO', value: 'NO' },
];

export default function MonthlyProgressEditor({
  periods,
  onChange,
  disabled = false,
  embedded = false,
  checkInOptions = 'default',
  urlVariant = 'button',
}) {
  const { t } = useTranslation();
  const checkInSelectOptions =
    checkInOptions === 'yesNo' ? MONTHLY_CHECKIN_YES_NO_OPTIONS : MONTHLY_CHECKIN_OPTIONS;
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
    <Select
      label={`${t('progress.monthlyCheckIn')} (${period.period_index})`}
      labelHidden
      options={checkInSelectOptions}
      value={period.monthly_check_in}
      onChange={updatePeriod(period.period_index, 'monthly_check_in')}
      disabled={disabled}
    />,
    <TextField
      label={`${t('progress.contentDelivered')} (${period.period_index})`}
      labelHidden
      value={period.content_delivered}
      onChange={updatePeriod(period.period_index, 'content_delivered')}
      placeholder={t('progress.describeContent')}
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
      variant={urlVariant}
    />,
    <InlineStack align="end">
      <Button
        variant="plain"
        tone="critical"
        disabled={disabled}
        onClick={() => clearPeriod(period.period_index)}
      >
        {t('progress.clearPeriod')}
      </Button>
    </InlineStack>,
  ]);

  return (
    <BlockStack gap="300">
      {embedded ? null : (
        <BlockStack gap="100">
          <Text as="h3" variant="headingMd">
            {t('progress.editorTitle')}
          </Text>
          <Text as="p" tone="subdued" variant="bodySm">
            {t('progress.editorHelp')}
          </Text>
        </BlockStack>
      )}
      <Box overflowX="auto" className={embedded ? 'crm-progress-edit-table' : undefined}>
        <DataTable
          columnContentTypes={['text', 'text', 'text', 'text', 'text']}
          headings={[
            t('progress.period'),
            t('progress.monthlyCheckIn'),
            t('progress.contentDelivered'),
            t('progress.link'),
            t('progress.actions'),
          ]}
          rows={rows}
          hideScrollIndicator={embedded}
        />
      </Box>
    </BlockStack>
  );
}
