# Pass 9: branded native iOS release package

## Included in automated native build
- Applies the official Orbital Drift image to the **actual Xcode AppIcon asset catalog**, rather than leaving the generated Capacitor template icon.
- Renders 1024 × 1024 PNG with a fully opaque deep-navy background, suitable for the iOS asset catalog. Supports catalogs with multiple size/scale icon entries.
- Sets native display name to **Orbital Drift**, maps native short version to package.json version (currently 0.26.0), and sets a numeric native build number from the GitHub Actions run number.
- Verifies display name, version, build and game icon asset during actual iPhone Simulator launch smoke testing.
- Remains unsigned and does not automatically publish to the App Store.

## Human release requirements
- Confirm final Bundle ID and Apple Developer signing.
- Provide a final native app icon quality review. The source icon is 512px and is rendered at 1024px; a true master 1024px icon would be preferable before public release.
- Run TestFlight, including reinstalls and upgrades, offline sessions and device performance.
- Configure signed StoreKit purchase flows and real ad SDK with consent/privacy compliance before monetization is enabled.
- Complete Apple privacy labels, age rating, screenshots and listing metadata.

Passing native packaging and Simulator smoke checks does not verify actual App Store delivery.
