// Tooling-based executable docs:
// doc-vitest turns @example blocks into Vitest tests.

type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E }

/**
 * Safely adds two integers.
 *
 * @example
 * ```ts @import.meta.vitest
 * expect(safeAdd(1, 2)).toEqual({ ok: true, value: 3 })
 * expect(safeAdd(9_999_999_999, 1)).toEqual(
 *   { ok: false, error: "overflow" },
 * )
 * ```
 */
export const safeAdd = (
  a: number,
  b: number,
): Result<number, "overflow"> => {
  const result = a + b
  return Math.abs(result) > 9_999_999_999
    ? { ok: false, error: "overflow" }
    : { ok: true, value: result }
}

// vitest.config.ts -> plugins: [doctest()], test: {
//   globals: true,
//   setupFiles: ["./vitest.setup.ts"],
//   includeSource: ["src/**/*.ts"],
// }
