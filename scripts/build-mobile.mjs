import { cp, mkdir, readdir, readFile, rm, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "dist");
const publicFiles = ["index.html", "manifest.webmanifest", "sw.js"];
const publicDirectories = ["assets"];

for (const name of [...publicFiles, ...publicDirectories]) {
  const source = path.join(root, name);
  await stat(source);
}
const manifest = JSON.parse(await readFile(path.join(root, "manifest.webmanifest"), "utf8"));
if (!manifest.name || !manifest.start_url || !Array.isArray(manifest.icons) || !manifest.icons.length) {
  throw new Error("Mobile build requires a valid web manifest with icons");
}
const html = await readFile(path.join(root, "index.html"), "utf8");
if (!html.includes('rel="manifest"') || !html.includes("<canvas")) {
  throw new Error("Mobile build requires the current game shell and manifest link");
}

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const name of publicFiles) {
  await cp(path.join(root, name), path.join(output, name));
}
for (const name of publicDirectories) {
  await cp(path.join(root, name), path.join(output, name), { recursive: true });
}
const entries = await readdir(output);
console.log(`Prepared mobile web assets in dist/ (${entries.join(", ")}).`);
