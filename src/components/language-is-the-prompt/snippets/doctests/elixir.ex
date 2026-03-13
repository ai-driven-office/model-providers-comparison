# Native executable docs: ExUnit runs @doc examples via doctest.
defmodule Math do
  @doc """
  Safely adds two integers.

  ## Examples

      iex> Math.safe_add(1, 2)
      {:ok, 3}

      iex> Math.safe_add(9_999_999_999, 1)
      {:error, :overflow}
  """
  @spec safe_add(integer(), integer()) ::
          {:ok, integer()} | {:error, :overflow}
  def safe_add(a, b) when is_integer(a) and is_integer(b) do
    result = a + b
    if abs(result) > 9_999_999_999,
      do: {:error, :overflow},
      else: {:ok, result}
  end
end

# math_test.exs
defmodule MathTest do
  use ExUnit.Case, async: true

  doctest Math
end

# Run: mix test
