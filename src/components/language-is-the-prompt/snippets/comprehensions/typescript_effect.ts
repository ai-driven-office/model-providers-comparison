import { Array, Option, Schema, Stream, pipe } from "effect"

type Pair = readonly [x: number, y: number]

class HonorRollEntry extends Schema.Class<HonorRollEntry>(
  "HonorRollEntry",
)({
  name: Schema.String,
  score: Schema.Number,
  grade: Schema.Literal("A"),
}) {}

const lines = ["Alice,88", "Bob,72", "Carol,91"]

const toHonorRollEntry = (line: string) => {
  const [name, scoreText] = line.split(",", 2)
  if (scoreText === undefined) {
    return Option.none()
  }

  const score = Number.parseInt(scoreText.trim(), 10)
  if (Number.isNaN(score) || score <= 80) {
    return Option.none()
  }

  return Option.some(
    new HonorRollEntry({
      name: name.trim(),
      score,
      grade: "A",
    }),
  )
}

const pairs: ReadonlyArray<Pair> = pipe(
  Array.Do,
  Array.bind("x", () => Array.range(1, 10)),
  Array.bind("y", () => Array.range(1, 10)),
  Array.filter(({ x, y }) => x + y > 12 && (x * y) % 3 === 0),
  Array.map(({ x, y }) => [x, y] as const),
)

const honorRoll = (lines: Iterable<string>) =>
  Stream.fromIterable(lines).pipe(
    Stream.filterMap(toHonorRollEntry),
  )

const program = Stream.runCollect(honorRoll(lines))
