using System;

abstract record Shape;
sealed record Circle(double Radius) : Shape;
sealed record Rect(double Width, double Height) : Shape;
sealed record Triangle(double BaseLength, double Height) : Shape;

static double Area(Shape shape) => shape switch
{
    Circle(var radius) => Math.PI * radius * radius,
    Rect(var width, var height) => width * height,
    Triangle(var baseLength, var height) =>
        0.5 * baseLength * height,
    _ => throw new ArgumentOutOfRangeException(nameof(shape))
};

Area(new Circle(5));          // 78.53981633974483
Area(new Rect(3, 4));         // 12
Area(new Triangle(6, 3));     // 9
