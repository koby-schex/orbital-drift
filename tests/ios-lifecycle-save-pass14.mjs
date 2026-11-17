import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const root=new URL("../",import.meta.url);
const read=(p)=>readFileSync(new URL(p,root),"utf8");
const html=read("index.html");
const plugin=read("native/ios/OrbitalDriftLifecyclePlugin.swift");
const installer=read("scripts/install-ios-storekit.mjs");
const controller=read("native/ios/OrbitalDriftBridgeViewController.swift");
assert.match(plugin,/UIApplication\.willResignActiveNotification/);
assert.match(plugin,/UIApplication\.didEnterBackgroundNotification/);
assert.match(plugin,/UIApplication\.didBecomeActiveNotification/);
assert.match(plugin,/notifyListeners\("stateChanged"/);
assert.match(controller,/registerPluginInstance\(OrbitalDriftLifecyclePlugin\(\)\)/);
assert.match(installer,/OrbitalDriftLifecyclePlugin\.swift/);
assert.match(html,/registerNativeLifecycle\(\);/);
const a=html.indexOf("      let lastLifecycleSaveAt = 0;");
const b=html.indexOf("      ui.saveImportInput?.addEventListener",a);
assert.ok(a>0&&b>a);
const segment=html.slice(a,b);
function harness({deleted=false,active=true}={}) {
  const callbacks={},data={saves:[],pauses:0,clean:0,ends:0,clears:0,suspends:0},keys=new Set(["thrust"]);
  const window={Capacitor:{Plugins:{OrbitalDriftLifecycle:{
    addListener:(name,cb)=>{callbacks.native=cb;return Promise.resolve({remove(){}});}
  }}}};
  const document={hidden:false,addEventListener:(name,cb)=>{callbacks[name]=cb;}};
  const audio={ctx:{state:"running",suspend:()=>{data.suspends++;return Promise.resolve();},resume:()=>Promise.resolve()}};
  const get=new Function("window","document","addEventListener","loop","keys",
    "endTouch","cleanControlButtons","hasActiveJourney","canResumePlay",
    "openPause","saveDeletedUntilExplicitSave","saveGame","audio","game","syncAudioSettings",
    segment+"\nreturn {suspendJourneyForBackground,foregroundJourney,registerNativeLifecycle};");
  const obj=get(window,document,(name,cb)=>{callbacks[name]=cb;},
    {last:32},keys,()=>data.ends++,()=>data.clean++,active,()=>active,
    ()=>data.pauses++,deleted,(...args)=>data.saves.push(args),audio,{settings:{music:"On"}},()=>{});
  return {callbacks,data,keys,...obj};
}
const h=harness();
h.registerNativeLifecycle();
assert.equal(typeof h.callbacks.native,"function");
h.callbacks.native({active:false});
h.callbacks.native({active:false});
h.callbacks.pagehide();
h.callbacks.beforeunload();
assert.equal(h.data.saves.length,1,"Duplicate native+web background signals must save only once");
assert.deepEqual(h.data.saves[0],[false,true],"Background saves must be silent");
assert.equal(h.keys.size,0,"Flight input must stop when app is backgrounded");
h.callbacks.native({active:true});
assert.equal(h.data.saves.length,1,"Foreground must not trigger a save");
const deleted=harness({deleted:true});
deleted.suspendJourneyForBackground();
assert.equal(deleted.data.saves.length,0,"Deleted slots must stay deleted during background");
const idle=harness({active:false});
idle.suspendJourneyForBackground();
assert.equal(idle.data.saves.length,0,"Title screen must not create phantom journey");
assert.match(html,/function saveGame\(manual = false, quiet = false\)/);
assert.match(html,/!quiet && game\.settings\?\.autosaveIndicator/);
assert.match(html,/let current, backup, wrotePrimary = false, wroteBackup = false/);
assert.match(html,/if \(wrotePrimary\) \{[\s\S]*?localStorage\.setItem\(SAVE_KEY, current\)/);
assert.match(html,/if \(wroteBackup\) \{[\s\S]*?localStorage\.setItem\(SAVE_BACKUP_KEY, backup\)/);
console.log("iOS lifecycle passed: native suspend/resume, duplicate-save protection, no phantom/deleted saves, and import rollback checks.");
