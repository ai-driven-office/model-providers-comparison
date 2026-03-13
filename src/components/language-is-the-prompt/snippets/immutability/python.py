from dataclasses import dataclass, replace

@dataclass(frozen=True, slots=True)
class CounterState:
    count: int
    history: tuple[int, ...] = ()

def increment(state: CounterState) -> CounterState:
    next_count = state.count + 1
    return replace(
        state,
        count=next_count,
        history=(*state.history, next_count),
    )

state = CounterState(count=0)
next_state = increment(state)

state.count      # 0
next_state.count # 1
