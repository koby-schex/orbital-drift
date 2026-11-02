# Orbital Drift — iOS-first release and advertising plan

## What this repository currently provides
Orbital Drift is a standalone HTML/Canvas game. The `npm run build:mobile` command
creates a clean, byte-identical web asset bundle in `dist/` for an eventual native iOS
shell (such as a Capacitor-based wrapper). This **does not** create an Xcode project, sign
an app, enable App Store purchases, or integrate any ad network.

## iOS packaging gates
1. Decide and register the final iOS Bundle ID and App Store Connect app listing.
2. Set up the selected native wrapper, development-team signing, and Xcode project.
3. Embed the local `dist/` assets in the app (no runtime dependency on web hosting).
4. Verify local save persistence, backup export/import, touch, pause/resume, orientation,
   audio, notch/home-indicator clearance, and low-memory handling in the native shell.
5. Test on physical iPhones and TestFlight before App Store submission.
6. Review App Store privacy labels, a public privacy policy, accessibility, age rating,
   ad reporting controls, and any payment/IAP details for the **actual** SDKs shipped.

## Advertising design constraints (not yet implemented)
- Free-to-play, with **small, labeled ads only in suitable non-interactive screens**.
- Never show banners during active flight, while aiming/steering, during the tutorial,
  while a dialog needs attention, or over controls, minimap, or game objectives.
- Use an anchored adaptive banner from the **native iOS ad SDK** only after iPhone
  safe-area and touch-hitbox testing. Avoid forcing a fixed-height banner into the
  WebGL/Canvas gameplay surface.
- Ads must be optional to gameplay: no internet or ad-fill means no placeholder,
  blocked screen, or lost rewards. Don't interrupt progression to solicit clicks.
- Do not enable personalized tracking by default. Evaluate consent/ATT requirements,
  the ad network's data practices, and App Store privacy disclosures before release.
- Include an accessible in-app way to report inappropriate ads as required by Apple.
- Use network-provided **test ad units** throughout development, never live ads during QA.
- Don't promise revenue: actual earnings depend on users, geography, and fill rates.

## Android later
Keep gameplay and content platform-neutral. Add Android SDK wiring and Android-specific
privacy/ad compliance in a separate phase after iOS validation.

## Test
```sh
npm test
npm run build:mobile
npm run test:mobile
```

The mobile package test verifies asset completeness, byte fidelity, and exclusion of
development files. It is **not** a native-device performance or App Store approval test.

## Capacitor iOS project foundation
The repository pins Capacitor 8.6.0 and `capacitor.config.json` uses the local
`dist/` bundle, not a remote server. The Bundle ID `com.orbitaldrift.game` is
**provisional** until a final Apple Developer Bundle ID has been confirmed.

The manual GitHub Actions workflow **Generate iOS Xcode Project** builds the game,
checks the tests, generates the native iOS project on macOS, and uploads an **unsigned
Xcode source project** as an artifact. This is not a signed IPA, not an automatic
TestFlight upload, and not a certified iOS build. Signing, app icon assets, native
save/device tests, and any ad SDK configuration remain future release gates.

To recreate the native wrapper in a configured macOS development environment:
```sh
npm install
npm run build:mobile
npx cap add ios
npm run ios:sync
npx cap open ios
```

Ads are not linked or requested by the wrapper; the game must remain playable offline.
