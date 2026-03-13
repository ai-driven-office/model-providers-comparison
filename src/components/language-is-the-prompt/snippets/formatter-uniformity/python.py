# Fast modern formatter: ruff format
def build_user(
    name: str,
    email: str,
    is_admin: bool,
) -> dict[str, object]:
    return {
        "name": name.strip(),
        "email": email.strip().lower(),
        "is_admin": is_admin,
        "tags": ["active", "staff" if is_admin else "member"],
    }
