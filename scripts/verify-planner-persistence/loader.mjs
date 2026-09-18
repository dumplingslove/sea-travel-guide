import { register } from "node:module";

const REPO = "/home/hatch/workspace/sea-migration/repo";

register(new URL("./hooks.mjs", import.meta.url));
