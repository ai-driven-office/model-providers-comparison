import Foundation

typealias Pair = (Int, Int)

struct HonorRollEntry {
    let name: String
    let score: Int
    let grade: String = "A"
}

let lines = ["Alice,88", "Bob,72", "Carol,91"]

let pairs: [Pair] = Array(
    (1...10).lazy.flatMap { x in
        (1...10).lazy.compactMap { y -> Pair? in
            x + y > 12 && (x * y).isMultiple(of: 3)
                ? (x, y)
                : nil
        }
    }
)

let results = Array(
    lines.lazy.compactMap { line -> HonorRollEntry? in
        let parts = line.split(separator: ",", maxSplits: 1)
        guard parts.count == 2,
              let score = Int(
                String(parts[1]).trimmingCharacters(
                    in: .whitespaces
                )
              ),
              score > 80 else {
            return nil
        }

        return HonorRollEntry(
            name: String(parts[0]).trimmingCharacters(
                in: .whitespaces
            ),
            score: score
        )
    }
)
