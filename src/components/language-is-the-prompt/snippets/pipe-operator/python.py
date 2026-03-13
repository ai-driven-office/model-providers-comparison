import re
from operator import attrgetter
from toolz.curried import filter, map, pipe

revenue = pipe(
    orders,
    filter(lambda o: o.status == "completed"),
    map(attrgetter("total")),
    sum,
    lambda total: round(total * 1.1, 2),
)
print(f"Revenue: {revenue}")

# More complex pipeline
result = pipe(
    "  Hello, World!  ",
    str.strip,
    str.lower,
    lambda s: re.sub(r"[^a-z0-9\s]", "", s),
    str.split,
    "-".join,
)
# => "hello-world"
