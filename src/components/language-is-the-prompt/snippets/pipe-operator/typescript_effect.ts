import { Array, String, pipe } from "effect"

// Effect's pipe() is the idiomatic today-runnable choice.
const revenue = pipe(
  orders,
  Array.filter((o) => o.status === "completed"),
  Array.map((o) => o.total),
  Array.reduce(0, (sum, total) => sum + total),
  (sum) => Math.round(sum * 1.1 * 100) / 100
)
console.log(`Revenue: ${revenue}`)

// More complex pipeline
const result = pipe(
  "  Hello, World!  ",
  String.trim,
  String.toLowerCase,
  (s) => s.replace(/[^a-z0-9\s]/g, ""),
  String.split(/\s+/),
  Array.join("-")
)
