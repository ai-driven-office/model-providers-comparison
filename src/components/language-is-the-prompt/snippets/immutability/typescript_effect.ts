import { Schema } from "effect"

class CounterState extends Schema.Class<CounterState>(
  "CounterState",
)({
  count: Schema.Number,
  history: Schema.Array(Schema.Number),
}) {}

const increment = (state: CounterState): CounterState => {
  const nextCount = state.count + 1

  return new CounterState({
    ...state,
    count: nextCount,
    history: [...state.history, nextCount],
  })
}

const state = new CounterState({ count: 0, history: [] })
const nextState = increment(state)

state.count // 0
nextState.count // 1
