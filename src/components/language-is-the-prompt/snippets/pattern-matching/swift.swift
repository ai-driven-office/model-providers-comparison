import Foundation

enum Shape {
  case circle(radius: Double)
  case rect(width: Double, height: Double)
  case triangle(base: Double, height: Double)
}

func area(_ shape: Shape) -> Double {
  switch shape {
  case let .circle(radius):
    return .pi * radius * radius
  case let .rect(width, height):
    return width * height
  case let .triangle(base, height):
    return 0.5 * base * height
  }
}

area(.circle(radius: 5))           // 78.53981633974483
area(.rect(width: 3, height: 4))   // 12
area(.triangle(base: 6, height: 3)) // 9
