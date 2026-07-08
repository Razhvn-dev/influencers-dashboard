import { Box } from '@shopify/polaris';
import CreatorSectionCard from './CreatorSectionCard';
import MonthlyProgressEditor from './MonthlyProgressEditor';
import MonthlyProgressReadView from './MonthlyProgressReadView';

export default function CreatorMonthlyProgressSection({
  periods,
  onChange,
  editing = false,
  onEdit,
  onDone,
}) {
  return (
    <CreatorSectionCard
      title="Monthly Progress"
      editing={editing}
      onEdit={onEdit}
      onDone={onDone}
      padding="0"
      readContent={<MonthlyProgressReadView periods={periods} />}
      editContent={
        <Box padding="500">
          <MonthlyProgressEditor periods={periods} onChange={onChange} embedded />
        </Box>
      }
    />
  );
}
