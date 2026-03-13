typedef CounterState = ({int count, List<int> history});

CounterState increment(CounterState state) {
  final nextCount = state.count + 1;

  return (
    count: nextCount,
    history: List<int>.unmodifiable([
      ...state.history,
      nextCount,
    ]),
  );
}

final state = (count: 0, history: List<int>.unmodifiable([]));
final nextState = increment(state);

state.count;     // 0
nextState.count; // 1
