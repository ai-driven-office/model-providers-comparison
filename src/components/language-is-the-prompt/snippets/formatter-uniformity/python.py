# Fast modern formatter: ruff format
from typing import Literal, TypedDict

class User(TypedDict):
    name: str
    email: str
    is_admin: bool
    tags: list[Literal["active", "staff", "member"]]

def build_user(
    name: str,
    email: str,
    is_admin: bool,
) -> User:
    return {
        "name": name.strip(),
        "email": email.strip().lower(),
        "is_admin": is_admin,
        "tags": ["active", "staff" if is_admin else "member"],
    }
