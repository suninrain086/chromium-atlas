type RouteHandler = (params: Record<string, string>) => void | Promise<void>;
interface Route { pattern: RegExp; keys: string[]; handler: RouteHandler; }

const routes: Route[] = [];
let notFound: RouteHandler = () => {};

export function route(pattern: string, handler: RouteHandler) {
  const keys: string[] = [];
  // Special token :path matches anything (used for nested folder/doc paths)
  const regex = new RegExp(
    "^" +
      pattern
        .replace(/\//g, "\\/")
        .replace(/:([a-zA-Z]+)\*/g, (_, k) => { keys.push(k); return "(.+)"; })
        .replace(/:([a-zA-Z]+)/g, (_, k) => { keys.push(k); return "([^\\/]+)"; }) +
      "$"
  );
  routes.push({ pattern: regex, keys, handler });
}

export function setNotFound(h: RouteHandler) { notFound = h; }

export function navigate(hash: string) {
  if (!hash.startsWith("#")) hash = "#" + hash;
  if (location.hash === hash) dispatch();
  else location.hash = hash;
}

function currentPath(): string {
  let h = location.hash || "#/";
  if (h.startsWith("#")) h = h.slice(1);
  if (!h.startsWith("/")) h = "/" + h;
  return h;
}

export async function dispatch() {
  const fullPath = currentPath();
  const [path, anchor] = fullPath.split("#");
  for (const r of routes) {
    const m = path.match(r.pattern);
    if (m) {
      const params: Record<string, string> = {};
      r.keys.forEach((k, i) => { params[k] = decodeURIComponent(m[i + 1]); });
      if (anchor) params.__anchor = decodeURIComponent(anchor);
      await r.handler(params);
      return;
    }
  }
  await notFound({});
}

export function startRouter() {
  window.addEventListener("hashchange", () => {
    dispatch();
    window.scrollTo(0, 0);
  });
}
