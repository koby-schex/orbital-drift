# TestFlight distribution — manual, gated release pipeline (Pass 10)

The `Prepare Signed iOS TestFlight Build` GitHub workflow is **manual only** and restricted to **main**. It does not run on pull requests. The regular simulator workflow remains the default quality gate.

## One-time setup in GitHub and Apple
1. Enroll in the Apple Developer Program and create the App Store Connect listing. Confirm the final Bundle ID and update `capacitor.config.json` to match before attempting distribution.
2. Create a protected GitHub **environment** named `ios-release`. Configure required reviewers to approve a distribution run.
3. Within that environment, set **variables** `IOS_TEAM_ID` (Apple Developer 10-character Team ID) and `IOS_BUNDLE_ID` (registered application identifier, must exactly match Capacitor).
4. Add **secrets** `IOS_DISTRIBUTION_CERTIFICATE_BASE64` (base64-encoded Apple Distribution .p12), `IOS_DISTRIBUTION_CERTIFICATE_PASSWORD`, and `IOS_PROVISIONING_PROFILE_BASE64` (base64-encoded App Store provisioning .mobileprovision). Never commit or paste these into a chat.
5. Only for explicit TestFlight uploads: add environment **variables** `APPSTORE_API_KEY_ID`, `APPSTORE_ISSUER_ID` and **secret** `APPSTORE_API_PRIVATE_KEY` (contents of downloaded .p8 App Store Connect API key). Give the API key only the permissions required for uploading builds.

## Run it
From **GitHub > Actions > Prepare Signed iOS TestFlight Build > Run workflow**, choose the `main` branch. Leave **upload_to_testflight = false** for an initial signed archive and private IPA download. Setting it to **true** uploads the signed IPA to Apple after signing, archiving, exporting and validating the package. A successful upload is not approval, nor does it automatically invite testers or publish to the App Store. Check App Store Connect processing and TestFlight compliance requirements separately.

## Release safety
- Missing credentials, incorrect Bundle ID, mismatched team/profile, expired profile and non-App-Store provisioning profiles fail the workflow before distribution.
- Signing assets are imported into an ephemeral macOS keychain. Temporary files are deleted when the job exits; no credentials are included in uploaded artifacts.
- Signed IPA is retained in the private GitHub Actions artifact for **3 days**. Ensure repository access controls are appropriate for sensitive release builds.
- The default workflow does not upload to Apple; upload requires an explicit `upload_to_testflight = true` selection.
- Do not provide live Apple credentials until the game's real StoreKit/ad implementations and final privacy disclosures have been separately validated. Physical iPhone/TestFlight testing remains a blocker.

## Still not implemented
Real StoreKit 2 purchase and restore bridges, an advertising SDK and consent/reporting UI. In the present build those native actions remain unavailable by design; no fake purchase or ad payout is permitted.
