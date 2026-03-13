type Pair = readonly [x: number, y: number]
type HonorRollEntry = {
  name: string
  score: number
  grade: "A"
}

const lines = ["Alice,88", "Bob,72", "Carol,91"]

function* matchingPairs(): Generator<Pair> {
  for (let x = 1; x <= 10; x++) {
    for (let y = 1; y <= 10; y++) {
      if (x + y > 12 && (x * y) % 3 === 0) {
        yield [x, y] as const
      }
    }
  }
}

function* honorRoll(
  lines: Iterable<string>,
): Generator<HonorRollEntry> {
  for (const line of lines) {
    const [name, scoreText] = line.split(",", 2)
    const score = Number.parseInt(scoreText.trim(), 10)

    if (score > 80) {
      yield { name: name.trim(), score, grade: "A" }
    }
  }
}

const pairs = [...matchingPairs()]
const results = [...honorRoll(lines)]
