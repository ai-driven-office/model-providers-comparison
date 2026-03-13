// Source-backed docs:
// DocFX publishes snippets from real tested files.
using System;
using Xunit;

public readonly record struct Result<T>(
    bool Ok,
    T Value,
    string? Error
);

public static Result<long> SafeAdd(long a, long b)
{
    var result = a + b;
    return Math.Abs(result) > 9_999_999_999
        ? new(false, 0, "overflow")
        : new(true, result, null);
}

// docs/articles/safe-add.md
// [!code-csharp[](../../tests/MathExamples.cs#safe-add)]

public sealed class MathExamples
{
    [Fact]
    public void SafeAdd_docs()
    {
#region safe-add
        Assert.Equal(
            new Result<long>(true, 3, null),
            SafeAdd(1, 2)
        );
        Assert.Equal(
            new Result<long>(false, 0, "overflow"),
            SafeAdd(9_999_999_999, 1)
        );
#endregion
    }
}
