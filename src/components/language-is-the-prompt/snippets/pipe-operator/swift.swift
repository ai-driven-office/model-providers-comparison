import Foundation

let revenue = (
    orders
        .filter { $0.status == .completed }
        .map(\.total)
        .reduce(0, +) * 1.1 * 100
).rounded() / 100
print("Revenue: \(revenue)")

let cleaned = String(
    "  Hello, World!  "
        .trimmingCharacters(in: .whitespacesAndNewlines)
        .lowercased()
        .filter { $0.isLetter || $0.isNumber || $0.isWhitespace }
)
let result = cleaned
    .split(whereSeparator: \.isWhitespace)
    .joined(separator: "-")
// => "hello-world"
