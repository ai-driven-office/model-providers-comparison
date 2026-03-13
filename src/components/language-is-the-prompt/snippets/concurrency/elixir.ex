defmodule Counter do
  use GenServer

  # Client API
  def start_link(initial \\ 0) do
    GenServer.start_link(__MODULE__, initial, name: __MODULE__)
  end

  def increment, do: GenServer.call(__MODULE__, :increment)
  def get,       do: GenServer.call(__MODULE__, :get)

  # Server callbacks  - explicit message handling
  @impl true
  def init(initial), do: {:ok, initial}

  @impl true
  def handle_call(:increment, _from, count),
    do: {:reply, count + 1, count + 1}

  @impl true
  def handle_call(:get, _from, count),
    do: {:reply, count, count}
end

# Usage: fully concurrent, no locks needed
{:ok, _} = Counter.start_link(0)
Counter.increment() # => 1
Counter.increment() # => 2
Counter.get()       # => 2
