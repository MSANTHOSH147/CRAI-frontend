export default function Card({ children, className = "", warm = false, flush = false, ...rest }) {
  const cls = ["crai-card", warm && "crai-card--warm", flush && "crai-card--flush", className]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={cls} {...rest}>
      {children}
    </div>
  );
}
