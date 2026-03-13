using System.Linq;
using System.Text.RegularExpressions;

var revenue = Math.Round(
    orders
        .Where(o => o.Status == "completed")
        .Select(o => o.Total)
        .Sum() * 1.1,
    2
);
Console.WriteLine($"Revenue: {revenue}");

// More complex pipeline
var result = string.Join(
    "-",
    Regex
        .Replace(
            "  Hello, World!  ".Trim().ToLowerInvariant(),
            @"[^a-z0-9\s]",
            ""
        )
        .Split(' ', StringSplitOptions.RemoveEmptyEntries)
);
// => "hello-world"
