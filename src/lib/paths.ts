// Path utilities — must match scripts/scan-docs.ts behavior 1:1.
//
// We re-implement minimal posix path logic because runtime is in the browser
// (no node:path). Both scanner and runtime call slugify + resolveRelativeMd
// to keep heading IDs and back-link resolution consistent.

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function dirname(p: string): string {
  const i = p.lastIndexOf("/");
  return i < 0 ? "" : p.slice(0, i);
}

function normalize(p: string): string {
  const parts = p.split("/");
  const out: string[] = [];
  for (const part of parts) {
    if (part === "" || part === ".") continue;
    if (part === "..") {
      if (out.length === 0) {
        out.push("..");
      } else if (out[out.length - 1] === "..") {
        out.push("..");
      } else {
        out.pop();
      }
    } else {
      out.push(part);
    }
  }
  return out.join("/");
}

export function joinPaths(...parts: string[]): string {
  return normalize(parts.filter(Boolean).join("/"));
}

export function basename(p: string): string {
  const i = p.lastIndexOf("/");
  return i < 0 ? p : p.slice(i + 1);
}

export function resolveRelativeMd(fromDocPath: string, href: string): string | null {
  const cleanHref = href.split("#")[0].split("?")[0];
  if (!cleanHref) return null;
  if (/^https?:\/\//i.test(cleanHref) || cleanHref.startsWith("//")) return null;
  if (!cleanHref.endsWith(".md")) return null;
  const dir = dirname(fromDocPath);
  const resolved = normalize(joinPaths(dir, cleanHref));
  if (resolved.startsWith("../") || resolved.startsWith("/")) return null;
  return resolved;
}

export function parentFolder(docOrFolder: string): string {
  return dirname(docOrFolder);
}

export function ancestorFolders(folderPath: string): string[] {
  if (!folderPath) return [];
  const parts = folderPath.split("/");
  const out: string[] = [];
  for (let i = 1; i <= parts.length; i++) out.push(parts.slice(0, i).join("/"));
  return out;
}

export { dirname, normalize };
