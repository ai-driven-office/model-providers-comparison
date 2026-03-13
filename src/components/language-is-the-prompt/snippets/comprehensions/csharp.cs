using System;
using System.Collections.Generic;
using System.Linq;

readonly record struct HonorRollEntry(
    string Name,
    int Score,
    string Grade
);

var lines = new[] { "Alice,88", "Bob,72", "Carol,91" };

var pairs =
    (from x in Enumerable.Range(1, 10)
     from y in Enumerable.Range(1, 10)
     let product = x * y
     where x + y > 12 && product % 3 == 0
     select (x, y)).ToArray();

static IEnumerable<HonorRollEntry> HonorRoll(
    IEnumerable<string> lines
)
{
    foreach (var line in lines)
    {
        var parts = line.Split(',', 2);
        if (
            parts.Length != 2
            || !int.TryParse(parts[1].Trim(), out var score)
            || score <= 80
        )
        {
            continue;
        }

        yield return new HonorRollEntry(
            parts[0].Trim(),
            score,
            "A"
        );
    }
}

var results = HonorRoll(lines).ToArray();
