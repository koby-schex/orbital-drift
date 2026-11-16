import UIKit
import Capacitor

/// Registers the local StoreKit 2 Capacitor bridge when the app loads.
class OrbitalDriftBridgeViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(OrbitalDriftStoreKitPlugin())
        bridge?.registerPluginInstance(OrbitalDriftAdMobPlugin())
    }
}
