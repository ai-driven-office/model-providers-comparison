import kotlin.math.PI

sealed interface Shape
data class Circle(val radius: Double) : Shape
data class Rect(val width: Double, val height: Double) : Shape
data class Triangle(val base: Double, val height: Double) : Shape

fun area(shape: Shape): Double = when (shape) {
  is Circle -> PI * shape.radius * shape.radius
  is Rect -> shape.width * shape.height
  is Triangle -> 0.5 * shape.base * shape.height
}

area(Circle(5.0))         // 78.53981633974483
area(Rect(3.0, 4.0))      // 12
area(Triangle(6.0, 3.0))  // 9
