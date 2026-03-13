import (
  "iter"
  "slices"
  "strconv"
  "strings"
)

type Pair = [2]int

type HonorRollEntry struct {
  Name  string
  Score int
  Grade string
}

func MatchingPairs() iter.Seq[Pair] {
  return func(yield func(Pair) bool) {
    for x := 1; x <= 10; x++ {
      for y := 1; y <= 10; y++ {
        if x+y > 12 && (x*y)%3 == 0 {
          if !yield(Pair{x, y}) {
            return
          }
        }
      }
    }
  }
}

func HonorRoll(lines []string) iter.Seq[HonorRollEntry] {
  return func(yield func(HonorRollEntry) bool) {
    for _, line := range lines {
      name, scoreText, found := strings.Cut(line, ",")
      if !found {
        continue
      }
      score, err := strconv.Atoi(strings.TrimSpace(scoreText))
      if err == nil && score > 80 {
        if !yield(HonorRollEntry{
          Name:  strings.TrimSpace(name),
          Score: score,
          Grade: "A",
        }) {
          return
        }
      }
    }
  }
}

lines := []string{"Alice,88", "Bob,72", "Carol,91"}
pairs := slices.Collect(MatchingPairs())
results := slices.Collect(HonorRoll(lines))
