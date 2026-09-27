import EmptyState from "../common/EmptyState.jsx";
import { Clock } from "lucide-react";

export default function RecentActivity({ items = [] }) {
  if (!items.length) {
    return (
      <EmptyState
        icon={Clock}
        title="No recent activity"
        body="CRAI hasn't logged any field activity yet."
      />
    );
  }
  return (
    <div className="crai-timeline">
      {items.map((item, i) => (
        <div className="crai-timeline-item" key={i}>
          <div className="crai-timeline-item__rail">
            <div style={{
              width: 8, height: 8, borderRadius: "50%",
              background: "var(--crai-green-500)", flexShrink: 0,
            }} />
            {i < items.length - 1 && <div className="crai-timeline-item__rail-line" />}
          </div>
          <div className="crai-timeline-item__time">{item.time}</div>
          <div>
            <div className="crai-timeline-item__body">{item.title}</div>
            {item.sub && <div className="crai-timeline-item__sub">{item.sub}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
