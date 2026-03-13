struct CounterState {
    let count: Int
    let history: [Int]

    func increment() -> CounterState {
        let nextCount = count + 1
        return CounterState(
            count: nextCount,
            history: history + [nextCount]
        )
    }
}

let state = CounterState(count: 0, history: [])
let nextState = state.increment()

state.count      // 0
nextState.count  // 1
