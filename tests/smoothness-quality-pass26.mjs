import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const extract=(a,b)=>html.slice(html.indexOf("      function "+a+"("),html.indexOf("      function "+b+"("));
const cadence=new Function(extract("frameCadence","shouldRenderFrame")+";return frameCadence")();
for(const hz of [60,90,120,144]){let prev,next,count=0;for(let i=0;i<hz*10;i++){const now=i*1000/hz;const r=cadence(now,prev,next,true);next=r.next;if(r.draw){prev=now;count++;}}assert.ok(Math.abs(count-300)<=1,"30 fps cadence at "+hz+" Hz: "+count);}
assert.equal(cadence(1000,20,33,false).draw,true);
assert.equal(cadence(2,20,33,true).draw,true);
const steps=new Function(extract("flightSubsteps","loop")+";return flightSubsteps")();
for(const dt of [0,.36,.72,1,1.5,2,10]){const s=steps(dt);assert.ok(s.every(x=>x>0&&x<=1));assert.ok(Math.abs(s.reduce((a,b)=>a+b,0)-Math.min(2,dt))<1e-10);}
assert.deepEqual(steps(NaN),[]);
const volume=new Function("clamp",extract("audioSettingVolume","applySettingsFromMenu")+";return audioSettingVolume")((v,a,b)=>Math.min(b,Math.max(a,v)));
assert.equal(volume("0",.55),0);assert.equal(volume("1",.55),1);assert.equal(volume("bad",.55),.55);
assert.match(html,/refreshTitleButtons\(snapshot.meta\)/);
assert.match(html,/resizeTitleCanvas.dpr/);
assert.match(html,/function queueViewportResize/);
assert.match(html,/function queueSkinPreviews/);
assert.match(html,/adNow-updateUI.adAt>=1000/);
assert.match(html,/now-updateProduction.fleetAt>=250/);
console.log("Smoothness pass: non-divisible refresh rates, bounded physics steps, volume zero, save metadata reuse and UI batching passed.");
