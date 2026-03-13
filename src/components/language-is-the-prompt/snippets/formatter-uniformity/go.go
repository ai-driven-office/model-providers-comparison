// Stricter drop-in formatter: gofumpt -w .
import "strings"

type User struct {
  Name  string
  Email string
  Admin bool
  Tags  []string
}

func BuildUser(name, email string, admin bool) User {
  tag := "member"
  if admin {
    tag = "staff"
  }

  return User{
    Name:  strings.TrimSpace(name),
    Email: strings.ToLower(strings.TrimSpace(email)),
    Admin: admin,
    Tags:  []string{"active", tag},
  }
}
