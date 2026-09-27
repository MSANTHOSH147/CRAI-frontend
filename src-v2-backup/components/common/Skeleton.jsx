export default function Skeleton({ width = "100%", height = 16, radius = 10, style = {} }) {
  return (
    <div
      className="crai-skel"
      style={{ width, height, borderRadius: radius, ...style }}
      aria-hidden="true"
    />
  );
}
