// Official formatter technology: swift-format format -ir Sources
struct User {
    let name: String
    let email: String
    let isAdmin: Bool
    let tags: [String]
}

func buildUser(
    name: String,
    email: String,
    isAdmin: Bool
) -> User {
    User(
        name: name.trimmingCharacters(
            in: .whitespacesAndNewlines
        ),
        email: email
            .trimmingCharacters(in: .whitespacesAndNewlines)
            .lowercased(),
        isAdmin: isAdmin,
        tags: ["active", isAdmin ? "staff" : "member"]
    )
}
