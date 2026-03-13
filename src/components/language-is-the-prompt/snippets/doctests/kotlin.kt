// Source-backed docs:
// KDoc @sample pulls in real sample functions.
sealed interface AddResult {
    data class Ok(val value: Long) : AddResult
    data object Overflow : AddResult
}

/**
 * Safely adds two integers.
 *
 * @sample Samples.safeAddOk
 * @sample Samples.safeAddOverflow
 */
fun safeAdd(a: Long, b: Long): AddResult {
    val result = a + b
    return if (kotlin.math.abs(result) > 9_999_999_999L)
        AddResult.Overflow
    else
        AddResult.Ok(result)
}

object Samples {
    fun safeAddOk() {
        check(safeAdd(1, 2) == AddResult.Ok(3))
    }

    fun safeAddOverflow() {
        check(safeAdd(9_999_999_999, 1) == AddResult.Overflow)
    }
}
