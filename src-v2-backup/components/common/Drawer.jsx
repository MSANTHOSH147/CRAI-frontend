import { X } from "lucide-react";

export default function Drawer({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="crai-drawer-overlay" onClick={onClose}>
      <div className="crai-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="crai-flex crai-items-center crai-justify-between" style={{ marginBottom: 18 }}>
          <h3 className="crai-title-lg">{title}</h3>
          <button className="crai-icon-btn" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
