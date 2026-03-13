// Tooling-based executable docs:
// doc-vitest runs the example; @effect/vitest fits the real test files.
import { Effect, Exit, Schema } from "effect"

class Overflow extends Schema.TaggedErrorClass<Overflow>()(
  "Overflow",
  {},
) {}

/**
 * Safely adds two integers.
 *
 * @example
 * ```ts @import.meta.vitest
 * const ok = await Effect.runPromiseExit(safeAdd(1, 2))
 * expect(ok).toStrictEqual(Exit.succeed(3))
 *
 * const overflow = await Effect.runPromiseExit(safeAdd(9_999_999_999, 1))
 * expect(Exit.isFailure(overflow)).toBe(true)
 * ```
 */
const safeAdd = Effect.fn("safeAdd")(function*(a: number, b: number) {
  const result = a + b
  if (Math.abs(result) > 9_999_999_999) {
    return yield* new Overflow({})
  }
  return result
})

// math.test.ts
// import { expect, it } from "@effect/vitest"
// it.effect("safeAdd docs stay honest", () =>
//   Effect.gen(function* () {
//     expect(yield* safeAdd(1, 2)).toBe(3)
//   }))
