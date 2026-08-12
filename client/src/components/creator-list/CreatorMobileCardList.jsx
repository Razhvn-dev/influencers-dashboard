import CreatorMobileCard from './CreatorMobileCard';

export default function CreatorMobileCardList({ records, onNavigate }) {
  return (
    <div className="crm-creator-mobile-list" aria-label="Creator cards">
      {records.map((record) => (
        <CreatorMobileCard key={record.id} record={record} onNavigate={() => onNavigate(record)} />
      ))}
    </div>
  );
}
