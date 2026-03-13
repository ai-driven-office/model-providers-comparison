import { Array, Schema, Stream, pipe } from "effect"

type Pair = readonly [x: number, y: number]

class HonorRollEntry extends Schema.Class<HonorRollEntry>(
  "HonorRollEntry",
)({
  name: Schema.String,
  score: Schema.Number,
  grade: Schema.Literal("A"),
}) {}

const ParsedEntry = Schema.Struct({
  name: Schema.String,
  score: Schema.NumberFromString,
})

const decodeEntry = Schema.decodeUnknownSync(ParsedEntry)

const lines = ["Alice,88", "Bob,72", "Carol,91"]

const pairs: ReadonlyArray<Pair> = pipe(
  Array.Do,
  Array.bind("x", () => Array.range(1, 10)),
  Array.bind("y", () => Array.range(1, 10)),
  Array.filter(({ x, y }) => x + y > 12 && (x * y) % 3 === 0),
  Array.map(({ x, y }) => [x, y] as const),
)

const honorRoll = (lines: Iterable<string>) =>
  Stream.fromIterable(lines).pipe(
    Stream.map((line) => {
      const [name, scoreText] = line.split(",", 2)
      return decodeEntry({
        name: name.trim(),
        score: scoreText.trim(),
      })
    }),
    Stream.filter(({ score }) => score > 80),
    Stream.map(
      ({ name, score }) => new HonorRollEntry({
        name,
        score,
        grade: "A",
      }),
    ),
  )

const program = Stream.runCollect(honorRoll(lines))
