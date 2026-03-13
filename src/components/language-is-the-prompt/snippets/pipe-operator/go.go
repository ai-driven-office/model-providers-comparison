import (
    "fmt"
    "math"
    "regexp"
    "strings"
)

var total float64
for _, order := range orders {
    if order.Status == "completed" {
        total += order.Total
    }
}
revenue := math.Round(total*1.1*100) / 100
fmt.Printf("Revenue: %.2f\n", revenue)

slugSource := strings.TrimSpace("  Hello, World!  ")
slugSource = strings.ToLower(slugSource)
slugSource = regexp.MustCompile(
  `[^a-z0-9\s]`,
).ReplaceAllString(slugSource, "")
result := strings.Join(strings.Fields(slugSource), "-")
// => "hello-world"
