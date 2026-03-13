type CounterState = Readonly<{
  count: number
  history: ReadonlyArray<number>
}>

const increment = (state: CounterState): CounterState => {
  const nextCount = state.count + 1
  return {
    ...state,
    count: nextCount,
    history: [...state.history, nextCount],
  }
}

const state: CounterState = { count: 0, history: [] }
const nextState = increment(state)

state.count // 0
nextState.count // 1
