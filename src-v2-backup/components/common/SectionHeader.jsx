export default function SectionHeader({ eyebrow, title, action }) {
  return (
    <div className="crai-section__head">
      <div>
        {eyebrow && <div className="crai-eyebrow">{eyebrow}</div>}
        {title && <h2 className="crai-title-lg" style={{ marginTop: 4 }}>{title}</h2>}
      </div>
      {action && <div className="crai-section__link">{action}</div>}
    </div>
  );
}
