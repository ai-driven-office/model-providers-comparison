using CSharpFunctionalExtensions;

public abstract record UpdateEmailError
{
    public sealed record NotFound(int UserId) : UpdateEmailError;
    public sealed record UpdateFailed(
        string Message
    ) : UpdateEmailError;
}

static Result<User, UpdateEmailError> FetchUser(
    int userId
) =>
    repo.Get(userId) is { } user
        ? Result.Success<User, UpdateEmailError>(user)
        : Result.Failure<User, UpdateEmailError>(
            new UpdateEmailError.NotFound(userId)
        );

static Result<User, UpdateEmailError> PersistEmail(
    User user,
    string newEmail
) =>
    repo.Update(user, newEmail)
        .MapError(
            message =>
                (UpdateEmailError)new UpdateEmailError
                    .UpdateFailed(message)
        );

static Result<User, UpdateEmailError> UpdateEmail(
    int userId,
    string newEmail
) =>
    FetchUser(userId).Bind(user => PersistEmail(user, newEmail));
