// Opinionated formatter: csharpier format .
using System.Collections.Generic;

public sealed record User(
    string Name,
    string Email,
    bool IsAdmin,
    IReadOnlyList<string> Tags
);

static User BuildUser(string name, string email, bool isAdmin) =>
    new(
        name.Trim(),
        email.Trim().ToLowerInvariant(),
        isAdmin,
        ["active", isAdmin ? "staff" : "member"]
    );
