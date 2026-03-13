using System.Collections.Immutable;

public sealed record CounterState(
    int Count,
    ImmutableArray<int> History
);

static CounterState Increment(CounterState state)
{
    var nextCount = state.Count + 1;

    return state with
    {
        Count = nextCount,
        History = state.History.Add(nextCount),
    };
}

var state = new CounterState(0, ImmutableArray<int>.Empty);
var nextState = Increment(state);

state.Count;     // 0
nextState.Count; // 1
