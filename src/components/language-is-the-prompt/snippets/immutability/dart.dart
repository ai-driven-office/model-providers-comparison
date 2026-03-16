import 'package:freezed_annotation/freezed_annotation.dart';

part 'counter_state.freezed.dart';

@freezed
class CounterState with _$CounterState {
  const factory CounterState({
    @Default(0) int count,
    @Default(<int>[]) List<int> history,
  }) = _CounterState;
}

CounterState increment(CounterState state) {
  final nextCount = state.count + 1;
  return state.copyWith(
    count: nextCount,
    history: [...state.history, nextCount],
  );
}

const state = CounterState();
final nextState = increment(state);

state.count;     // 0
nextState.count; // 1
