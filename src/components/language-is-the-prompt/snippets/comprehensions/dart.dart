typedef Pair = (int, int);
typedef HonorRollEntry = ({
  String name,
  int score,
  String grade,
});

final lines = ['Alice,88', 'Bob,72', 'Carol,91'];

final pairs = <Pair>[
  for (final x in Iterable<int>.generate(10, (i) => i + 1))
    for (final y in Iterable<int>.generate(10, (i) => i + 1))
      if (x + y > 12 && (x * y) % 3 == 0) (x, y),
];

Iterable<HonorRollEntry> honorRoll(
  Iterable<String> lines,
) sync* {
  for (final line in lines) {
    if (line.split(',') case [final name, final scoreText]) {
      final score = int.tryParse(scoreText.trim());
      if (score != null && score > 80) {
        yield (name: name.trim(), score: score, grade: 'A');
      }
    }
  }
}

final results = honorRoll(lines).toList();
