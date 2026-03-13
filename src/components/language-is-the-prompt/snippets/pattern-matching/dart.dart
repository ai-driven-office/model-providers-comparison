import 'dart:math';

sealed class Shape {
  const Shape();
}

final class Circle extends Shape {
  const Circle(this.radius);
  final double radius;
}

final class Rect extends Shape {
  const Rect(this.width, this.height);
  final double width;
  final double height;
}

final class Triangle extends Shape {
  const Triangle(this.baseLength, this.height);
  final double baseLength;
  final double height;
}

double area(Shape shape) => switch (shape) {
  Circle(radius: final radius) => pi * radius * radius,
  Rect(
    width: final width,
    height: final height,
  ) => width * height,
  Triangle(baseLength: final baseLength, height: final height) =>
    0.5 * baseLength * height,
};

area(const Circle(5));      // 78.53981633974483
area(const Rect(3, 4));     // 12
area(const Triangle(6, 3)); // 9
