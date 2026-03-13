type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rect"; width: number; height: number }
  | { kind: "triangle"; base: number; height: number }

const area = (shape: Shape): number => {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2
    case "rect":
      return shape.width * shape.height
    case "triangle":
      return 0.5 * shape.base * shape.height
    default: {
      const exhaustiveCheck: never = shape
      return exhaustiveCheck
    }
  }
}

area({ kind: "circle", radius: 5 }) // 78.53981633974483
area({ kind: "rect", width: 3, height: 4 }) // 12
area({ kind: "triangle", base: 6, height: 3 }) // 9
