data class HonorRollEntry(
    val name: String,
    val score: Int,
    val grade: String = "A",
)

val lines = sequenceOf("Alice,88", "Bob,72", "Carol,91")

val pairs = sequence {
    for (x in 1..10) {
        for (y in 1..10) {
            if (x + y > 12 && (x * y) % 3 == 0) {
                yield(x to y)
            }
        }
    }
}.toList()

fun honorRoll(lines: Sequence<String>) =
    lines.mapNotNull { line ->
        val parts = line.split(",", limit = 2)
        if (parts.size != 2) return@mapNotNull null

        val score = parts[1].trim().toIntOrNull()
            ?: return@mapNotNull null
        if (score > 80) {
            HonorRollEntry(parts[0].trim(), score)
        } else {
            null
        }
    }

val results = honorRoll(lines).toList()
