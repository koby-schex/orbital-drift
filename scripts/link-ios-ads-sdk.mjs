#!/usr/bin/env node
// Add Google Mobile Ads and UMP Swift packages to the generated Capacitor
// Xcode project. Dependencies are explicitly pinned, never fetched from the
// browser/game at runtime.
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const project = path.join(root, "ios/App/App.xcodeproj/project.pbxproj");
let content = await readFile(project, "utf8");
const packages = [
  {id:"DF123456789ABCDEF0123001", dep:"DF123456789ABCDEF0123101", build:"DF123456789ABCDEF0123201", name:"GoogleMobileAds", repo:"https://github.com/googleads/swift-package-manager-google-mobile-ads.git", version:"13.12.0"},
  {id:"DF123456789ABCDEF0123002", dep:"DF123456789ABCDEF0123102", build:"DF123456789ABCDEF0123202", name:"GoogleUserMessagingPlatform", repo:"https://github.com/googleads/swift-package-manager-google-user-messaging-platform.git", version:"3.1.0"}
];
if (content.includes(packages[0].id)) throw new Error("Ad SDK already attached");
function section(name, entries) {
  const end = `/* End ${name} section */`;
  if (!content.includes(end)) throw new Error("Missing Xcode section: " + name);
  content = content.replace(end, entries + "\n" + end);
}
function ensureSection(name, before) {
  if (content.includes(`/* Begin ${name} section */`)) return;
  if (!content.includes(before)) throw new Error("Missing insertion point for "+name);
  content = content.replace(before,`/* Begin ${name} section */\n/* End ${name} section */\n\n`+before);
}
ensureSection("XCRemoteSwiftPackageReference", "/* Begin XCBuildConfiguration section */");
ensureSection("XCSwiftPackageProductDependency", "/* Begin XCRemoteSwiftPackageReference section */");
section("XCRemoteSwiftPackageReference",packages.map(p=>`${p.id} /* XCRemoteSwiftPackageReference "${p.repo.split("/").at(-1).replace(".git","")}" */ = {isa = XCRemoteSwiftPackageReference; repositoryURL = "${p.repo}"; requirement = {kind = exactVersion; version = ${p.version}; }; };`).join("\n"));
section("XCSwiftPackageProductDependency", packages.map(p=>`${p.dep} /* ${p.name} */ = {isa = XCSwiftPackageProductDependency; package = ${p.id}; productName = ${p.name}; };`).join("\n"));
section("PBXBuildFile",packages.map(p=>`${p.build} /* ${p.name} in Frameworks */ = {isa = PBXBuildFile; productRef = ${p.dep} /* ${p.name} */; };`).join("\n"));
const target=content.indexOf("/* Begin PBXNativeTarget section */");
const targetEnd=content.indexOf("/* End PBXNativeTarget section */",target);
if(target<0 || targetEnd<0) throw new Error("No native target section");
let snippet=content.slice(target,targetEnd);
const appTarget=snippet.match(/([A-F0-9]{24}) \/\* App \*\/ = \{\s*isa = PBXNativeTarget;[\s\S]*?\n\s*\};/);
if(!appTarget) throw new Error("Unexpected Capacitor App target layout");
let updated=appTarget[0];
const dependencies=packages.map(p=>p.dep+" /* "+p.name+" */").join(", ");
if (updated.includes("packageProductDependencies = ("))
  updated=updated.replace("packageProductDependencies = (", "packageProductDependencies = ( "+dependencies+", ");
else
  updated=updated.replace(/(productName = App;)/, "packageProductDependencies = ( "+dependencies+" );\n\t\t\t$1");
snippet=snippet.replace(appTarget[0],updated);
content=content.slice(0,target)+snippet+content.slice(targetEnd);
const projectStart=content.indexOf("/* Begin PBXProject section */");
const projectEnd=content.indexOf("/* End PBXProject section */",projectStart);
let projectSection=content.slice(projectStart,projectEnd);
const projectObject=projectSection.match(/([A-F0-9]{24}) \/\* Project object \*\/ = \{\s*isa = PBXProject;[\s\S]*?\n\s*\};/);
if(!projectObject) throw new Error("Unexpected project object layout");
let projectUpdated=projectObject[0];
const references=packages.map(p=>p.id).join(", ");
if (projectUpdated.includes("packageReferences = ("))
  projectUpdated=projectUpdated.replace("packageReferences = (", "packageReferences = ( "+references+", ");
else
  projectUpdated=projectUpdated.replace(/(mainGroup = [^;]+;)/,"packageReferences = ( "+references+" );\n\t\t\t$1");
projectSection=projectSection.replace(projectObject[0],projectUpdated);
content=content.slice(0,projectStart)+projectSection+content.slice(projectEnd);
const frameworksStart=content.indexOf("/* Begin PBXFrameworksBuildPhase section */");
const frameworksEnd=content.indexOf("/* End PBXFrameworksBuildPhase section */",frameworksStart);
let frameworks=content.slice(frameworksStart,frameworksEnd);
if(!frameworks.includes("files = ("))throw new Error("Missing framework build phase");
frameworks=frameworks.replace("files = (",`files = (\n${packages.map(p=> "\t\t\t\t"+p.build+" /* "+p.name+" in Frameworks */,").join("\n")}`);
content=content.slice(0,frameworksStart)+frameworks+content.slice(frameworksEnd);
await writeFile(project,content);
console.log("Linked pinned GoogleMobileAds 13.12.0 and UMP 3.1.0 to the generated Xcode target");
