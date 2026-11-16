import Foundation
import UIKit
import Capacitor
#if canImport(GoogleMobileAds) && canImport(UserMessagingPlatform)
import GoogleMobileAds
import UserMessagingPlatform
#endif

/// Consent-first, opt-in-only advertisements. No banners over flight, no
/// interstitials, and no reward without the SDK's earned-reward callback.
@objc(OrbitalDriftAdMobPlugin)
public class OrbitalDriftAdMobPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "OrbitalDriftAdMobPlugin"
    public let jsName = "OrbitalDriftAdMob"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "status", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "showRewarded", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "privacyOptions", returnType: CAPPluginReturnPromise)
    ]

    #if canImport(GoogleMobileAds) && canImport(UserMessagingPlatform)
    private var consentUpdatedThisLaunch = false
    private var consentPending = false
    private var adsStarted = false
    private var rewarding = false
    private var rewardedCall: CAPPluginCall?
    private var rewardedEarned = false
    private var rewardedAd: RewardedAd?

    private var appConfigured: Bool {
        guard let id = Bundle.main.object(forInfoDictionaryKey: "GADApplicationIdentifier") as? String,
              id.hasPrefix("ca-app-pub-") else { return false }
        return true
    }

    private var rewardedUnit: String? {
        guard let id = Bundle.main.object(forInfoDictionaryKey: "OrbitalDriftRewardedUnitID") as? String,
              id.hasPrefix("ca-app-pub-") else { return nil }
        return id
    }

    private func consentReady() -> Bool {
        consentUpdatedThisLaunch && ConsentInformation.shared.canRequestAds
    }

    private func ready() -> Bool {
        appConfigured && rewardedUnit != nil && adsStarted && consentReady()
    }

    private func statusPayload() -> [String: Any] {
        [
            "available": ready(),
            "privacyOptionsRequired": ConsentInformation.shared.privacyOptionsRequirementStatus == .required
        ]
    }

    private func refreshConsent() {
        guard appConfigured, !consentPending, !consentUpdatedThisLaunch else { return }
        consentPending = true
        let parameters = RequestParameters()
        ConsentInformation.shared.requestConsentInfoUpdate(with: parameters) { [weak self] error in
            guard let self else { return }
            self.consentPending = false
            self.consentUpdatedThisLaunch = true
            if error != nil && !ConsentInformation.shared.canRequestAds { return }
            ConsentForm.loadAndPresentIfRequired(from: self.bridge?.viewController) { [weak self] _ in
                guard let self, self.consentReady(), !self.adsStarted else { return }
                MobileAds.shared.start()
                self.adsStarted = true
            }
        }
    }
    #endif

    @objc public func status(_ call: CAPPluginCall) {
        #if canImport(GoogleMobileAds) && canImport(UserMessagingPlatform)
        DispatchQueue.main.async {
            self.refreshConsent()
            call.resolve(self.statusPayload())
        }
        #else
        call.resolve(["available": false, "privacyOptionsRequired": false])
        #endif
    }

    @objc public func privacyOptions(_ call: CAPPluginCall) {
        #if canImport(GoogleMobileAds) && canImport(UserMessagingPlatform)
        DispatchQueue.main.async {
            guard self.appConfigured && self.consentUpdatedThisLaunch else {
                call.reject("Advertising privacy options are not configured.")
                return
            }
            ConsentForm.presentPrivacyOptionsForm(from: self.bridge?.viewController) { error in
                if let error { call.reject(error.localizedDescription) }
                else { call.resolve(self.statusPayload()) }
            }
        }
        #else
        call.reject("Advertising privacy options are not available in this build.")
        #endif
    }

    @objc public func showRewarded(_ call: CAPPluginCall) {
        #if canImport(GoogleMobileAds) && canImport(UserMessagingPlatform)
        DispatchQueue.main.async {
            guard self.ready(), !self.rewarding,
                  let unit = self.rewardedUnit,
                  let viewController = self.bridge?.viewController else {
                call.resolve(["completed": false, "reason": "ad-unavailable"])
                return
            }
            self.rewarding = true
            self.rewardedEarned = false
            self.rewardedCall = call
            Task { @MainActor in
                do {
                    let ad = try await RewardedAd.load(with: unit, request: Request())
                    self.rewardedAd = ad
                    ad.fullScreenContentDelegate = self
                    ad.present(from: viewController) {
                        self.rewardedEarned = true
                    }
                } catch {
                    self.completeRewarded(false)
                }
            }
        }
        #else
        call.resolve(["completed": false, "reason": "ad-sdk-unavailable"])
        #endif
    }

    #if canImport(GoogleMobileAds) && canImport(UserMessagingPlatform)
    private func completeRewarded(_ succeeded: Bool) {
        guard rewarding else { return }
        rewarding = false
        rewardedAd = nil
        let callback = rewardedCall
        rewardedCall = nil
        callback?.resolve(["completed": succeeded && rewardedEarned])
        rewardedEarned = false
    }
    #endif
}

#if canImport(GoogleMobileAds) && canImport(UserMessagingPlatform)
extension OrbitalDriftAdMobPlugin: FullScreenContentDelegate {
    public func adDidDismissFullScreenContent(_ ad: FullScreenPresentingAd) {
        completeRewarded(true)
    }

    public func ad(_ ad: FullScreenPresentingAd, didFailToPresentFullScreenContentWithError error: Error) {
        completeRewarded(false)
    }
}
#endif
