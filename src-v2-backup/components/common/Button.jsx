export default function Button({
  variant = "primary",
  size,
  block = false,
  as: As = "button",
  className = "",
  children,
  ...rest
}) {
  const cls = [
    "crai-btn",
    `crai-btn--${variant}`,
    size === "sm" && "crai-btn--sm",
    block && "crai-btn--block",
    className,
  ].filter(Boolean).join(" ");
  return (
    <As className={cls} {...rest}>
      {children}
    </As>
  );
}
