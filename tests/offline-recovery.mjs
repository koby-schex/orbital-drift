import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../sw.js', import.meta.url), 'utf8');
const handlers = new Map();
const deleted = [];
let writes = 0, refuseWrites = false;
let cached = new Response('<html>Working game</html>', {status:200});
let fetchResult = async () => new Response('Unavailable', {status:503});
const cache = {
  match: async () => cached?.clone(),
  put: async (_key, response) => {
    if (refuseWrites) throw new Error('Cache full');
    writes++; cached = response;
  },
};
const current = source.match(/CACHE_NAME = "([^"]+)"/)[1];
const context = {
  self: {addEventListener:(type, cb)=>handlers.set(type,cb), skipWaiting(){}, clients:{claim(){}}, registration:{scope:'https://example.com/orbital-drift/'}},
  URL,
  caches: {
    keys:async()=>['orbital-drift-v0.24.0', current, 'another-app-cache'],
    delete:async key=>deleted.push(key),
    open:async()=>cache,
  },
  fetch:(...args)=>fetchResult(...args),
  Response,
};
vm.runInNewContext(source, context);
let activation;
handlers.get('activate')({waitUntil:task=>activation=task});
await activation;
assert.deepEqual(deleted,['orbital-drift-v0.24.0'], 'Updates must preserve unrelated apps on the same origin');

async function navigate() {
  let response; const tasks=[];
  handlers.get('fetch')({request:{method:'GET',mode:'navigate'},
    respondWith:task=>response=task, waitUntil:task=>tasks.push(task)});
  const result=await response; await Promise.all(tasks); return result;
}
assert.equal(await (await navigate()).text(), '<html>Working game</html>');
assert.equal(writes,0,'A server error must not overwrite the offline game');
fetchResult = async()=>{throw new Error('Offline')};
assert.equal(await (await navigate()).text(), '<html>Working game</html>');
fetchResult = async()=>new Response('<html>New game</html>');
assert.equal(await (await navigate()).text(), '<html>New game</html>');
assert.equal(writes,1);
refuseWrites=true;
fetchResult = async()=>new Response('<html>Online game</html>');
assert.equal(await (await navigate()).text(), '<html>Online game</html>', 'Cache quota failures must not block online play');
assert.equal(writes,1);
cached=null;
fetchResult = async()=>new Response('Unavailable',{status:503});
assert.equal((await navigate()).status,503);
fetchResult = async()=>{throw new Error('Offline')};
assert.equal((await navigate()).type,'error','An uncached offline request must return a valid error Response');

function assetRequest(url) {
  let intercepted = false;
  let task;
  handlers.get('fetch')({
    request: {method:'GET',mode:'cors',url},
    respondWith(value) { intercepted = true; task = value; },
  });
  return {intercepted, task};
}

assert.equal(assetRequest('https://other.example/assets/deep-field.webp').intercepted, false,
  'Third-party resources must not be intercepted or cached');
assert.equal(assetRequest('https://example.com/orbital-drift/api/account').intercepted, false,
  'Dynamic or private endpoints must not be intercepted or cached');
assert.equal(assetRequest('https://example.com/another-app/assets/deep-field.webp').intercepted, false,
  'Assets outside the service worker scope must not be cached');

cached = null;
refuseWrites = true;
fetchResult = async () => new Response('Asset online', {status:200});
let asset = assetRequest('https://example.com/orbital-drift/assets/deep-field.webp');
assert.equal(asset.intercepted, true, 'Bundled game art should be served through the offline cache');
assert.equal(await (await asset.task).text(), 'Asset online',
  'A failed runtime asset cache write must not fail the online response');
assert.equal(writes, 1, 'Failed cache writes must not be counted as successful');
refuseWrites = false;
asset = assetRequest('https://example.com/orbital-drift/assets/deep-field.webp');
assert.equal(await (await asset.task).text(), 'Asset online');
assert.equal(writes, 2, 'Successful runtime asset fetches must enter the cache');

console.log('Runtime caching passed: no third-party/private resource interception, scoped asset caching, and quota-safe delivery.');

console.log('Offline recovery passed: scoped cache cleanup, HTTP-error fallback, offline launch, cache refresh, and quota failure.');
