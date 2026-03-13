import (
  "errors"
  "fmt"
)

var ErrNotFound = errors.New("user not found")

func fetchUser(userID int) (User, error) {
  user, ok := repo.Get(userID)
  if !ok {
    return User{}, ErrNotFound
  }
  return user, nil
}

func updateEmail(userID int, newEmail string) (User, error) {
  user, err := fetchUser(userID)
  if err != nil {
    return User{}, err
  }

  updated, err := repo.Update(user, newEmail)
  if err != nil {
    return User{}, fmt.Errorf("update email: %w", err)
  }
  return updated, nil
}

if _, err := updateEmail(
  42,
  "new@example.com",
); errors.Is(err, ErrNotFound) {
  log.Println("missing user")
}
