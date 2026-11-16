import Foundation
import Capacitor
import StoreKit

/// Native purchases are never simulated. StoreKit 2 verifies each transaction
/// and current entitlement before resolving an unlock to JavaScript.
@objc(OrbitalDriftStoreKitPlugin)
public class OrbitalDriftStoreKitPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "OrbitalDriftStoreKitPlugin"
    public let jsName = "OrbitalDriftStoreKit"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "purchase", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "restorePurchases", returnType: CAPPluginReturnPromise)
    ]

    private let allowedProducts: Set<String> = [
        "orbitaldrift.removeads.permanent",
        "orbitaldrift.ship.solarflare",
        "orbitaldrift.frigate.abyss",
        "orbitaldrift.fleet.solarconvoy",
        "orbitaldrift.trail.solarribbon",
        "orbitaldrift.trail.relicember",
        "orbitaldrift.combo.ancienthunter"
    ]

    private func eligible(_ transaction: StoreKit.Transaction) -> Bool {
        return allowedProducts.contains(transaction.productID)
            && transaction.productType == .nonConsumable
            && transaction.revocationDate == nil
    }

    private func receipt(_ transaction: StoreKit.Transaction) -> [String: Any] {
        return [
            "productId": transaction.productID,
            "transactionId": String(transaction.id),
            "verified": true,
            "completed": true,
            "environment": "app-store"
        ]
    }

    @objc public func purchase(_ call: CAPPluginCall) {
        guard let productId = call.getString("productId"),
              allowedProducts.contains(productId) else {
            call.reject("Unknown or unsupported StoreKit product.")
            return
        }
        Task {
            do {
                let products = try await Product.products(for: [productId])
                guard let product = products.first(where: { $0.id == productId && $0.type == .nonConsumable }) else {
                    call.reject("This in-app purchase is not configured in the App Store.")
                    return
                }
                let result = try await product.purchase()
                switch result {
                case .success(let verification):
                    switch verification {
                    case .verified(let transaction):
                        guard eligible(transaction) else {
                            call.reject("This StoreKit transaction is revoked or not eligible.")
                            return
                        }
                        call.resolve(receipt(transaction))
                        await transaction.finish()
                    case .unverified:
                        call.reject("Apple could not verify this transaction.")
                    }
                case .userCancelled:
                    call.resolve(["productId": productId, "verified": false, "cancelled": true])
                case .pending:
                    call.resolve(["productId": productId, "verified": false, "completed": false])
                @unknown default:
                    call.reject("Unexpected StoreKit purchase result.")
                }
            } catch {
                call.reject("App Store purchase unavailable: \(error.localizedDescription)")
            }
        }
    }

    @objc public func restorePurchases(_ call: CAPPluginCall) {
        Task {
            do {
                try await AppStore.sync()
                var purchases: [[String: Any]] = []
                for await result in StoreKit.Transaction.currentEntitlements {
                    guard case .verified(let transaction) = result, eligible(transaction) else {
                        continue
                    }
                    purchases.append(receipt(transaction))
                }
                call.resolve(["purchases": purchases])
            } catch {
                call.reject("Apple purchase restoration failed: \(error.localizedDescription)")
            }
        }
    }
}
