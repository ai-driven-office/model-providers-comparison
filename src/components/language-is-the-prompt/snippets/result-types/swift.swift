enum UpdateEmailError: Error {
  case notFound(userId: Int)
  case updateFailed(message: String)
}

func fetchUser(id: Int) -> Result<User, UpdateEmailError> {
  guard let user = repo.get(id) else {
    return .failure(.notFound(userId: id))
  }
  return .success(user)
}

func persistEmail(
  _ user: User,
  newEmail: String
) -> Result<User, UpdateEmailError> {
  repo.update(user, email: newEmail)
    .mapError { .updateFailed(message: $0.localizedDescription) }
}

func updateEmail(
  userId: Int,
  newEmail: String
) -> Result<User, UpdateEmailError> {
  fetchUser(id: userId).flatMap { user in
    persistEmail(user, newEmail: newEmail)
  }
}
