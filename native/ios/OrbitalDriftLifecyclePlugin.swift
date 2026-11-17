import Foundation
import UIKit
import Capacitor

/// iOS may suspend a WKWebView without delivering pagehide. Forward native
/// UIApplication state changes so the game can synchronously preserve progress.
@objc(OrbitalDriftLifecyclePlugin)
public class OrbitalDriftLifecyclePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "OrbitalDriftLifecyclePlugin"
    public let jsName = "OrbitalDriftLifecycle"
    public let pluginMethods: [CAPPluginMethod] = []

    public override func load() {
        NotificationCenter.default.addObserver(
            self, selector: #selector(willResignActive),
            name: UIApplication.willResignActiveNotification, object: nil
        )
        NotificationCenter.default.addObserver(
            self, selector: #selector(didEnterBackground),
            name: UIApplication.didEnterBackgroundNotification, object: nil
        )
        NotificationCenter.default.addObserver(
            self, selector: #selector(didBecomeActive),
            name: UIApplication.didBecomeActiveNotification, object: nil
        )
    }

    @objc private func willResignActive() {
        notifyListeners("stateChanged", data: ["active": false])
    }

    @objc private func didEnterBackground() {
        notifyListeners("stateChanged", data: ["active": false])
    }

    @objc private func didBecomeActive() {
        notifyListeners("stateChanged", data: ["active": true])
    }

    deinit {
        NotificationCenter.default.removeObserver(self)
    }
}
