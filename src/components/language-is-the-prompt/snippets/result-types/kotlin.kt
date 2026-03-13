import arrow.core.Either
import arrow.core.mapLeft
import arrow.core.raise.either
import arrow.core.raise.ensureNotNull

sealed interface UpdateEmailError
data class NotFound(val userId: Int) : UpdateEmailError
data class UpdateFailed(val message: String) : UpdateEmailError

fun fetchUser(
  userId: Int
): Either<UpdateEmailError, User> = either {
  ensureNotNull(repo.get(userId)) { NotFound(userId) }
}

fun persistEmail(
  user: User,
  newEmail: String,
): Either<UpdateEmailError, User> =
  repo.update(user, email = newEmail).mapLeft(::UpdateFailed)

fun updateEmail(
  userId: Int,
  newEmail: String,
): Either<UpdateEmailError, User> = either {
  val user = fetchUser(userId).bind()
  persistEmail(user, newEmail).bind()
}
