import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const files = ["index.html", "manifest.webmanifest", "sw.js"];
const assets = await readdir(path.join(root, "assets"));
assert.ok(assets.length > 0, "Mobile package must include its artwork");
for (const file of [...files, ...assets.map((asset) => `assets/${asset}`)]) {
  const [original, bundled] = await Promise.all([
    readFile(path.join(root, file)),
    readFile(path.join(dist, file)),
  ]);
  assert.ok(original.equals(bundled), `Mobile package must preserve ${file} byte-for-byte`);
}
const entries = await readdir(dist);
assert.deepEqual(entries.sort(), ["assets", ...files].sort(),
  "The packaged app must not contain source tests, development notes, or private files");
const manifest = JSON.parse(await readFile(path.join(dist, "manifest.webmanifest"), "utf8"));
for (const icon of manifest.icons) {
  assert.ok(icon.src.startsWith("./assets/"), "Manifest icons must remain local");
  assert.ok((await stat(path.join(dist, icon.src))).isFile(), `Missing mobile icon ${icon.src}`);
}
const html = await readFile(path.join(dist, "index.html"), "utf8");
assert.ok(html.includes('href="./manifest.webmanifest"'), "Mobile shell must link the local manifest");
assert.ok(html.includes('src="./assets/') || html.includes('href="./assets/'),
  "Mobile shell must reference bundled game assets");
console.log("Mobile package passed: exact game assets, complete icons, and no development files.");
