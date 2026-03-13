// Checked doc examples:
// dartdoc_test validates examples under dart test.
import 'package:dartdoc_test/dartdoc_test.dart';

/// Safely adds two integers.
///
/// ```dart
/// safeAdd(1, 2);  // => Ok(3)
/// safeAdd(9_999_999_999, 1);  // => Err('overflow')
/// ```
Result<int> safeAdd(int a, int b) {
  final result = a + b;
  if (result.abs() > 9999999999) return Err('overflow');
  return Ok(result);
}

// test/dartdoc_test.dart
void main() {
  runDartdocTest();
}
