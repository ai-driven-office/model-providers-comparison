from dataclasses import dataclass
from math import pi

@dataclass(frozen=True, slots=True)
class Circle:
    radius: float

@dataclass(frozen=True, slots=True)
class Rect:
    width: float
    height: float

@dataclass(frozen=True, slots=True)
class Triangle:
    base: float
    height: float

type Shape = Circle | Rect | Triangle

def area(shape: Shape) -> float:
    match shape:
        case Circle(radius):
            return pi * radius ** 2
        case Rect(width, height):
            return width * height
        case Triangle(base, height):
            return 0.5 * base * height

area(Circle(5))         # 78.53981633974483
area(Rect(3, 4))        # 12
area(Triangle(6, 3))    # 9.0
