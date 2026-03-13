import { Match, Schema } from "effect"

class Circle extends Schema.TaggedClass<Circle>()("Circle", {
  radius: Schema.Number,
}) {}

class Rect extends Schema.TaggedClass<Rect>()("Rect", {
  width: Schema.Number,
  height: Schema.Number,
}) {}

class Triangle extends Schema.TaggedClass<Triangle>()("Triangle", {
  base: Schema.Number,
  height: Schema.Number,
}) {}

type Shape = Circle | Rect | Triangle

const area = Match.type<Shape>().pipe(
  Match.tag("Circle", ({ radius }) => Math.PI * radius ** 2),
  Match.tag("Rect", ({ width, height }) => width * height),
  Match.tag("Triangle", ({ base, height }) => 0.5 * base * height),
  Match.exhaustive,
)

area(new Circle({ radius: 5 })) // 78.53981633974483
area(new Rect({ width: 3, height: 4 })) // 12
area(new Triangle({ base: 6, height: 3 })) // 9
