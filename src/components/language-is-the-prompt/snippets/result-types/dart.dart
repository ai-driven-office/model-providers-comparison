import 'package:fpdart/fpdart.dart';

sealed class UpdateEmailError {
  const UpdateEmailError();
}

final class NotFound extends UpdateEmailError {
  const NotFound(this.userId);
  final int userId;
}

final class UpdateFailed extends UpdateEmailError {
  const UpdateFailed(this.message);
  final String message;
}

Either<UpdateEmailError, User> fetchUser(int userId) =>
  Option.fromNullable(repo.get(userId))
      .toEither(() => NotFound(userId));

Either<UpdateEmailError, User> persistEmail(
  User user,
  String newEmail,
) =>
  repo.update(user, email: newEmail).mapLeft(UpdateFailed.new);

Either<UpdateEmailError, User> updateEmail(
  int userId,
  String newEmail,
) =>
  Either.Do((_) {
    final user = _(fetchUser(userId));
    return _(persistEmail(user, newEmail));
  });
