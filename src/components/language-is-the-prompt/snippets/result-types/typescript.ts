type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E }

type UpdateEmailError =
  | { type: "not_found"; userId: number }
  | { type: "update_failed"; message: string }

const fetchUser = (
  userId: number,
): Result<User, UpdateEmailError> => {
  const user = repo.get(userId)
  return user
    ? { ok: true, value: user }
    : { ok: false, error: { type: "not_found", userId } }
}

const persistEmail = (
  user: User,
  newEmail: string,
): Result<User, UpdateEmailError> => {
  const result = repo.update(user, { email: newEmail })
  return result.ok
    ? result
    : {
        ok: false,
        error: { type: "update_failed", message: result.error },
      }
}

const updateEmail = (
  userId: number,
  newEmail: string,
): Result<User, UpdateEmailError> => {
  const userResult = fetchUser(userId)
  if (!userResult.ok) return userResult

  return persistEmail(userResult.value, newEmail)
}
