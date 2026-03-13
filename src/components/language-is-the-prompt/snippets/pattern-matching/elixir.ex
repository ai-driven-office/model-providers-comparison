defmodule Shape do
  def area({:circle, r}), do: :math.pi() * r * r
  def area({:rect, w, h}), do: w * h
  def area({:triangle, b, h}), do: 0.5 * b * h
end

Shape.area({:circle, 5})    # => 78.54
Shape.area({:rect, 3, 4})   # => 12
Shape.area({:triangle, 6, 3}) # => 9.0
