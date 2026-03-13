// Opinionated formatter: ktfmt --kotlinlang-style
data class User(
    val name: String,
    val email: String,
    val isAdmin: Boolean,
    val tags: List<String>,
)

fun buildUser(
    name: String,
    email: String,
    isAdmin: Boolean,
): User =
    User(
        name = name.trim(),
        email = email.trim().lowercase(),
        isAdmin = isAdmin,
        tags = listOf(
            "active",
            if (isAdmin) "staff" else "member",
        ),
    )
