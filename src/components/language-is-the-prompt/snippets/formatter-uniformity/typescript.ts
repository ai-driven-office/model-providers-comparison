// Opinionated formatter: Biome
type User = {
  readonly name: string
  readonly email: string
  readonly isAdmin: boolean
  readonly tags: ReadonlyArray<string>
}

const buildUser = (
  name: string,
  email: string,
  isAdmin: boolean,
): User =>
  ({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    isAdmin,
    tags: ["active", isAdmin ? "staff" : "member"],
  }) satisfies User
