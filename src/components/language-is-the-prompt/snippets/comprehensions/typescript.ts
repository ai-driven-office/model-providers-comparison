type Pair = readonly [x: number, y: number]
type HonorRollEntry = {
  readonly name: string
  readonly score: number
  readonly grade: "A"
}

const lines = ["Alice,88", "Bob,72", "Carol,91"] as const

const numbers = Array.from({ length: 10 }, (_, index) => index + 1)

const toHonorRollEntry = (
  line: string,
): HonorRollEntry | null => {
  const [name, scoreText] = line.split(",", 2)
  if (scoreText === undefined) {
    return null
  }

  const score = Number.parseInt(scoreText.trim(), 10)
  if (Number.isNaN(score) || score <= 80) {
    return null
  }

  return {
    name: name.trim(),
    score,
    grade: "A",
  }
}

const pairs: ReadonlyArray<Pair> = numbers.flatMap((x) =>
  numbers.flatMap((y) =>
    x + y > 12 && (x * y) % 3 === 0
      ? [[x, y] as const]
      : [],
  ),
)

const results: ReadonlyArray<HonorRollEntry> = lines.flatMap(
  (line) => {
    const entry = toHonorRollEntry(line)
    return entry ? [entry] : []
  },
)
