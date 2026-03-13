from dataclasses import dataclass
from typing import Iterable, Iterator, Literal

lines = ["Alice,88", "Bob,72", "Carol,91"]

type Pair = tuple[int, int]

@dataclass(frozen=True, slots=True)
class HonorRollEntry:
    name: str
    score: int
    grade: Literal["A"] = "A"

pairs: list[Pair] = [
    (x, y)
    for x in range(1, 11)
    for y in range(1, 11)
    if x + y > 12 and (x * y) % 3 == 0
]

def honor_roll(lines: Iterable[str]) -> Iterator[HonorRollEntry]:
    for line in lines:
        name, score_text = line.split(",", maxsplit=1)
        if (score := int(score_text.strip())) > 80:
            yield HonorRollEntry(name=name.strip(), score=score)

results = list(honor_roll(lines))
