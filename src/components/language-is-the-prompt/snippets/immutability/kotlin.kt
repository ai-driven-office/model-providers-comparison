data class CounterState(
    val count: Int,
    val history: List<Int> = emptyList(),
)

fun increment(state: CounterState): CounterState {
    val nextCount = state.count + 1
    return state.copy(
        count = nextCount,
        history = state.history + nextCount,
    )
}

val state = CounterState(count = 0)
val nextState = increment(state)

state.count      // 0
nextState.count  // 1
