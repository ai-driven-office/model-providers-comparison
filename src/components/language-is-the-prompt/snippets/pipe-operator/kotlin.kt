import kotlin.math.round

val revenue = orders
    .asSequence()
    .filter { it.status == Status.COMPLETED }
    .sumOf { it.total }
    .let { round(it * 1.1 * 100) / 100 }
    .also { println("Revenue: $it") }

// More complex pipeline
val result = "  Hello, World!  "
    .trim()
    .lowercase()
    .replace(Regex("[^a-z0-9\\s]"), "")
    .split(Regex("\\s+"))
    .joinToString("-")
// => "hello-world"
