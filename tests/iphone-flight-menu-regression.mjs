import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const html=await readFile(new URL("../index.html",import.meta.url),"utf8");
function extract(name,next) {
  const a=html.indexOf("      function "+name+"(");
  const b=html.indexOf("      function "+next+"(",a+1);
  assert.ok(a>=0&&b>a,"Cannot find "+name);
  return html.slice(a,b);
}
const game={ship:{x:200,y:0,vx:2,vy:0,maxFuel:100,maxBoost:100,fuel:0,boost:0},
 system:{bodies:[{name:"Sun",type:"star",x:210,y:0,radius:80},
 {name:"Mars",type:"planet",x:220,y:0,radius:35},
 {name:"Jupiter",type:"planet",x:550,y:0,radius:45}]},
 frigate:{built:true},captainLog:{rescueCount:0}};
const lock=new Function("game","frigatePosition","canOrbitLock","selectedPlanetName","visualRadius",
 extract("nearestLockTarget","toggleOrbit")+"\nreturn nearestLockTarget;")(
 game,()=>null,b=>b.type!=="star"&&Math.hypot(game.ship.x-b.x,game.ship.y-b.y)-b.radius<175,
 "Mars",b=>b.radius);
assert.equal(lock().body.name,"Mars","A closer star must never block planet lock");
game.ship.x=550;
assert.equal(lock().body.name,"Jupiter","Out-of-range selected planet must not block reachable target");
game.ship.x=9999;
assert.equal(lock().body,null);
const rescue={phase:"outbound",time:0,duration:40,x:0,y:0,vx:0,vy:0,
 startX:0,startY:0,lastX:0,lastY:0,targetX:882,targetY:0,heading:Math.PI/2};
game.ship.x=1000;
game.ship.y=0;
let saveCount=0,dockCount=0;
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const angleDiff=(a,b)=>{let d=((a-b+Math.PI)%(2*Math.PI))-Math.PI;return d< -Math.PI?d+2*Math.PI:d;};
const rescueUpdate=new Function("game","clamp","angleDiff","toast","frigateHomePosition",
 "placeShipAtFrigate","saveGame","state",
 "let pioneerRescue=state.value;\n"+extract("updatePioneerRescue","solarCrash")+
 "\nreturn dt=>{updatePioneerRescue(dt);state.value=pioneerRescue;};")(
 game,clamp,angleDiff,()=>{},()=>({x:0,y:0}),()=>dockCount++,()=>saveCount++,
 {get value(){return rescueState;},set value(v){rescueState=v;}});
let rescueState=rescue;
rescueUpdate(20);
assert.ok(rescue.x>0&&rescue.x<882);
assert.equal(game.ship.x,1000);
rescueUpdate(20);
assert.equal(rescue.phase,"service");
assert.equal(rescue.x,882);
assert.equal(game.ship.lockBody,"__FRIGATE__");
assert.equal(game.ship.lockRadius,118);
const heading=rescue.heading;
rescueUpdate(20);
assert.equal(rescue.heading,heading,"Stationary Pioneer must retain heading");
rescueUpdate(62);
assert.equal(rescue.phase,"returning");
rescueUpdate(145);
assert.equal(rescueState,null);
assert.equal(saveCount,1);
assert.equal(dockCount,1);
assert.match(extract("updateShip","scanPlanet"),/if \(!updateOrbit\(dt\) && !pioneerRescue\)/);
assert.match(extract("updateOrbit","angleDiff"),/pioneerRescue && s\.lockBody === "__FRIGATE__"/);
assert.doesNotMatch(extract("addMobileMenuFooter","closeMenuAction"),/mobile-menu-note/);
assert.doesNotMatch(extract("renderResources","resourceHint"),/resourceHint\(k\)/);
console.log("iPhone planet lock, Pioneer rescue and menu clarity tests passed.");
