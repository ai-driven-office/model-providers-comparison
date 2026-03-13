import "math"

type Shape interface{ shape() }

type Circle struct{ Radius float64 }
func (Circle) shape() {}

type Rect struct {
  Width  float64
  Height float64
}
func (Rect) shape() {}

type Triangle struct {
  Base   float64
  Height float64
}
func (Triangle) shape() {}

func area(shape Shape) float64 {
  switch s := shape.(type) {
  case Circle:
    return math.Pi * s.Radius * s.Radius
  case Rect:
    return s.Width * s.Height
  case Triangle:
    return 0.5 * s.Base * s.Height
  }
  panic("unreachable")
}

area(Circle{Radius: 5})          // 78.53981633974483
area(Rect{Width: 3, Height: 4})  // 12
area(Triangle{Base: 6, Height: 3}) // 9
