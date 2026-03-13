// High-performance formatter: oxfmt
import { Schema, String, pipe } from "effect"

class User extends Schema.Class<User>("User")({
  name: Schema.String,
  email: Schema.String,
  isAdmin: Schema.Boolean,
  tags: Schema.Array(Schema.String),
}) {}

const buildUser = (
  name: string,
  email: string,
  isAdmin: boolean,
): User =>
  new User({
    name: pipe(name, String.trim),
    email: pipe(email, String.trim, String.toLowerCase),
    isAdmin,
    tags: ["active", isAdmin ? "staff" : "member"],
  })
