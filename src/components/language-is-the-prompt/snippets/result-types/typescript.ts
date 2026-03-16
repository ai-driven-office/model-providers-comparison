import { err, ok, type Result } from "neverthrow"

type UpdateEmailError =
  | { readonly type: "not_found"; readonly userId: number }
  | { readonly type: "update_failed"; readonly message: string }

const fetchUser = (
  userId: number,
): Result<User, UpdateEmailError> => {
  const user = repo.get(userId)
  return user
    ? ok(user)
    : err({ type: "not_found", userId } as const)
}

const persistEmail = (
  user: User,
  newEmail: string,
): Result<User, UpdateEmailError> => {
  return repo
    .update(user, { email: newEmail })
    .mapErr((message) => ({ type: "update_failed", message } as const))
}

const updateEmail = (userId: number, newEmail: string) =>
  fetchUser(userId).andThen((user) =>
    persistEmail(user, newEmail),
  )
