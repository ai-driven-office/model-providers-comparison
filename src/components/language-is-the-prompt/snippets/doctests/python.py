# Native executable docs: doctest runs these examples directly.
from typing import Literal

type SafeAddResult = (
    tuple[Literal["ok"], int]
    | tuple[Literal["error"], Literal["overflow"]]
)

def safe_add(a: int, b: int) -> SafeAddResult:
    """Safely adds two integers.

    >>> safe_add(1, 2)
    ('ok', 3)
    >>> safe_add(9_999_999_999, 1)
    ('error', 'overflow')
    """
    result = a + b
    if abs(result) > 9_999_999_999:
        return ("error", "overflow")
    return ("ok", result)

# Run: pytest --doctest-modules
# Or: python -m doctest -v math.py
