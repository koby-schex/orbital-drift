import AppKit
import Foundation

guard CommandLine.arguments.count == 3 else {
    fatalError("Usage: swift render-ios-app-icon.swift source.png output.png")
}
let input = CommandLine.arguments[1]
let output = CommandLine.arguments[2]
guard let source = NSImage(contentsOfFile: input) else {
    fatalError("Game icon source was not found")
}
let size = 1024
guard let bitmap = NSBitmapImageRep(
    bitmapDataPlanes: nil, pixelsWide: size, pixelsHigh: size,
    bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true,
    isPlanar: false, colorSpaceName: .deviceRGB,
    bytesPerRow: 0, bitsPerPixel: 0
) else { fatalError("Could not allocate icon pixels") }
NSGraphicsContext.saveGraphicsState()
guard let context = NSGraphicsContext(bitmapImageRep: bitmap) else {
    fatalError("Could not create icon graphics context")
}
NSGraphicsContext.current = context
context.imageInterpolation = .high
NSColor(calibratedRed: 3.0/255.0, green: 5.0/255.0,
        blue: 17.0/255.0, alpha: 1).setFill()
NSRect(x: 0, y: 0, width: size, height: size).fill()
source.draw(in: NSRect(x: 0, y: 0, width: size, height: size),
            from: .zero, operation: .sourceOver, fraction: 1)
context.flushGraphics()
NSGraphicsContext.restoreGraphicsState()
guard let png = bitmap.representation(using: .png, properties: [:]) else {
    fatalError("Could not encode final iOS icon")
}
try png.write(to: URL(fileURLWithPath: output))
print("Created opaque-background 1024px Orbital Drift iOS app icon")
