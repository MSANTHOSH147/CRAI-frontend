export function getRoute() {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  if (path === "/") return { name: "home" };
  if (path === "/fields") return { name: "fields" };
  if (path.startsWith("/fields/")) return { name: "field", id: path.split("/")[2] };
  if (path === "/alerts") return { name: "alerts" };
  if (path === "/ask-crai") return { name: "ask" };
  if (path === "/expert") return { name: "expert" };
  if (path === "/demo") return { name: "demo" };
  if (path === "/settings") return { name: "settings" };
  return { name: "home" };
}

export function navigate(path) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new Event("crai:navigate"));
  window.scrollTo({ top: 0, behavior: "smooth" });
}
