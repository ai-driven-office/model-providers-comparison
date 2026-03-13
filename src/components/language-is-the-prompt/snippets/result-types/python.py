from dataclasses import dataclass
from returns.result import Failure, Result, Success

@dataclass(frozen=True, slots=True)
class NotFound:
    user_id: int

@dataclass(frozen=True, slots=True)
class UpdateFailed:
    message: str

type UpdateEmailError = NotFound | UpdateFailed

def fetch_user(user_id: int) -> Result[User, UpdateEmailError]:
    user = repo.get(user_id)
    return (
        Success(user)
        if user is not None
        else Failure(NotFound(user_id))
    )

def persist_email(
    user: User,
    new_email: str,
) -> Result[User, UpdateEmailError]:
    return repo.update(user, email=new_email).alt(UpdateFailed)

def update_email(
    user_id: int,
    new_email: str,
) -> Result[User, UpdateEmailError]:
    return fetch_user(user_id).bind(
        lambda user: persist_email(user, new_email)
    )
