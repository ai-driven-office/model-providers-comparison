defmodule Counter do
  def increment(state) do
    next = state.count + 1

    %{
      state
      | count: next,
        history: state.history ++ [next]
    }
  end
end

state = %{count: 0, history: []}
next_state = Counter.increment(state)

state.count      # => 0
next_state.count # => 1
