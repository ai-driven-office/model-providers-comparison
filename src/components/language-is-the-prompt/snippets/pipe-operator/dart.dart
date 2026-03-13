final revenue = (
  orders
      .where((o) => o.status == OrderStatus.completed)
      .map((o) => o.total)
      .fold<double>(0, (sum, total) => sum + total) *
  1.1
).toStringAsFixed(2);
print('Revenue: $revenue');

// More complex pipeline
final result = '  Hello, World!  '
    .trim()
    .toLowerCase()
    .replaceAll(RegExp(r'[^a-z0-9\s]'), '')
    .split(RegExp(r'\s+'))
    .join('-');
// => "hello-world"
