import "slices"

type CounterState struct {
  Count   int
  History []int
}

func Increment(state CounterState) CounterState {
  nextCount := state.Count + 1
  history := slices.Clone(state.History)
  history = append(history, nextCount)

  return CounterState{
    Count:   nextCount,
    History: history,
  }
}

state := CounterState{Count: 0, History: []int{}}
nextState := Increment(state)

state.Count     // 0
nextState.Count // 1
