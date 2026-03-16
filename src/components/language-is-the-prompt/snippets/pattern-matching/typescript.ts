import { match } from "ts-pattern"

type Shape =
  | { readonly kind: "circle"; readonly radius: number }
  | { readonly kind: "rect"; readonly width: number; readonly height: number }
  | { readonly kind: "triangle"; readonly base: number; readonly height: number }

const area = (shape: Shape): number =>
  match(shape)
    .with({ kind: "circle" }, ({ radius }) => Math.PI * radius ** 2)
    .with({ kind: "rect" }, ({ width, height }) => width * height)
    .with(
      { kind: "triangle" },
      ({ base, height }) => 0.5 * base * height,
    )
    .exhaustive()

area({ kind: "circle", radius: 5 }) // 78.53981633974483
area({ kind: "rect", width: 3, height: 4 }) // 12
area({ kind: "triangle", base: 6, height: 3 }) // 9
