// High-performance formatter: oxfmt
type User = {
  name: string
  email: string
  isAdmin: boolean
  tags: ReadonlyArray<string>
}

const buildUser = (
  name: string,
  email: string,
  isAdmin: boolean,
): User => ({
  name: name.trim(),
  email: email.trim().toLowerCase(),
  isAdmin,
  tags: ["active", isAdmin ? "staff" : "member"],
})
