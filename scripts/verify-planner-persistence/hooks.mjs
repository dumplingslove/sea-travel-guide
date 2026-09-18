const REPO = "/home/hatch/workspace/sea-migration/repo";
const { existsSync } = await import("node:fs");

function withTs(p) {
  if (p.endsWith(".ts") || p.endsWith(".mjs") || p.endsWith(".js") || p.endsWith(".json")) return p;
  return existsSync(p + ".ts") ? p + ".ts" : p;
}

export async function resolve(specifier, context, next) {
  if (specifier === "@/lib/supabase") {
    return { url: new URL("./supabase-stub.mjs", import.meta.url).href, shortCircuit: true };
  }
  if (specifier.startsWith("@/")) {
    const p = withTs(REPO + "/client/src/" + specifier.slice(2));
    return { url: new URL("file://" + p).href, shortCircuit: true };
  }
  if (specifier.startsWith("./") || specifier.startsWith("../")) {
    const parent = new URL(context.parentURL);
    if (parent.protocol === "file:" && parent.pathname.startsWith(REPO)) {
      const p = withTs(new URL(specifier, parent).pathname);
      return { url: "file://" + p, shortCircuit: true };
    }
  }
  return next(specifier, context);
}

export async function load(url, context, next) {
  if (url.endsWith(".json") && url.startsWith("file://" + REPO)) {
    const { readFileSync } = await import("node:fs");
    const source = readFileSync(new URL(url), "utf8");
    return { format: "json", source, shortCircuit: true };
  }
  return next(url, context);
}
