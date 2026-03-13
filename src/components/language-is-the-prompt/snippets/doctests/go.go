// Native executable docs:
// Example... functions run under go test.
package math

import (
  "errors"
  "fmt"
)

var ErrOverflow = errors.New("overflow")

// SafeAdd safely adds two integers.
func SafeAdd(a, b int64) (int64, error) {
  result := a + b
  if result > 9_999_999_999 || result < -9_999_999_999 {
    return 0, ErrOverflow
  }
  return result, nil
}

func ExampleSafeAdd() {
  result, _ := SafeAdd(1, 2)
  fmt.Println(result)
  // Output: 3
}

func ExampleSafeAdd_overflow() {
  _, err := SafeAdd(9_999_999_999, 1)
  fmt.Println(err)
  // Output: overflow
}
