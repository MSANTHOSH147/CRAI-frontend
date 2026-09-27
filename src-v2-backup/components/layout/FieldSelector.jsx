export default function FieldSelector({ fieldName, zoneName }) {
  const initial = (fieldName || "F").slice(0, 1).toUpperCase();
  return (
    <button className="crai-field-select" type="button">
      <span className="avatar">{initial}</span>
      <span>{fieldName || "Select field"}{zoneName ? ` · ${zoneName}` : ""}</span>
    </button>
  );
}
