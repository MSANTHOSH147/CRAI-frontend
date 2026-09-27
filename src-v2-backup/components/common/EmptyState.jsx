export default function EmptyState({ icon: Icon, title, body, action }) {
  return (
    <div className="crai-empty">
      {Icon && <div className="crai-empty__icon"><Icon size={24} /></div>}
      <div className="crai-empty__title">{title}</div>
      {body && <div className="crai-empty__body">{body}</div>}
      {action}
    </div>
  );
}
