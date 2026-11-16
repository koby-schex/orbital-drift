# Native Ads — Privacy-First Pass 12

## What is being added
- Google Mobile Ads iOS SDK **13.12.0** and Google User Messaging Platform (UMP) **3.1.0** through pinned Swift Package Manager dependencies, compiled into the native app.
- A first-party `OrbitalDriftAdMob` Capacitor bridge with `status`, `showRewarded` and `privacyOptions` methods.
- Consent information is refreshed on app launch before any ad request. Required UMP consent form is shown before loading. No ad is requested unless UMP allows it.
- Reward completion is only returned after the SDK's earned-reward callback and ad dismissal. Failed, denied, cancelled, unavailable and non-rendered ads cannot grant resources.
- The game's Privacy Options button opens UMP's native form when applicable; otherwise it explains that privacy options are not available.
- **No automatic interstitial ads**, no interruption of major reward moments and **no banner in flight**. Rewarded advertising is strictly opt-in. This intentionally prioritizes the relaxing exploration experience over ad frequency.
- Simulators may use Google's **official test IDs**. Never click real ads while testing.

## Production setup
Configure GitHub's protected `ios-release` environment variables:
- `IOS_ADMOB_APP_ID` — registered iOS AdMob app ID, format `ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY`
- `IOS_ADMOB_REWARDED_UNIT_ID` — iOS rewarded unit ID, format `ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY`

Both variables are required together. When either is absent, distribution builds **must keep ad requests disabled**. Do not substitute test IDs in App Store production builds. App ID alone does not establish permission to request personalized ads.

Create and configure Privacy & Messaging forms in AdMob, including required consent and privacy controls. Review Apple privacy manifests, App Store privacy labels, SKAdNetwork identifiers, ATT requirements and AdMob's inappropriate-ad reporting process before releasing. Validate regional privacy handling using Google's test-device tools and signed TestFlight builds.

## What this does NOT claim
Passing npm tests and a macOS Simulator compile cannot prove live ad fill, actual impressions/revenue, consent messaging in every region, StoreKit billing, or production privacy compliance. Test on a physical iPhone before distribution.

References:
- https://developers.google.com/admob/ios/quick-start
- https://developers.google.com/admob/ios/privacy
- https://developers.google.com/admob/ios/rewarded
