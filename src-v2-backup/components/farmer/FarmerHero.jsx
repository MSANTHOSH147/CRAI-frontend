const STATUS_LABEL = {
  healthy: "Healthy",
  attention: "Needs attention",
  monitoring: "Monitoring",
  evidence_needed: "Evidence needed",
};

export default function FarmerHero({ fieldName, zoneName, crop, status, imageUrl }) {
  return (
    <div className="crai-hero">
      {imageUrl ? (
        <img className="crai-hero__img" src={imageUrl} alt="" />
      ) : (
        <div className="crai-hero__img" style={{ background: "linear-gradient(155deg,#2E5A41,#0E4A38)" }} />
      )}
      <div className="crai-hero__scrim" />
      <div className="crai-hero__content">
        <div>
          <div className="crai-hero__label">{zoneName || "Field"}</div>
          <div className="crai-hero__name">{fieldName || "Your field"}</div>
          <div className="crai-hero__meta">{crop ? `Crop: ${crop}` : "Crop not set"}</div>
        </div>
        <span className="crai-badge crai-hero__badge">
          {status ? (STATUS_LABEL[status] || status) : "Evidence needed"}
        </span>
      </div>
    </div>
  );
}
