import { filter, map, pipe } from "remeda"

// Runs today in Node/Bun. Native |> is still a proposal.
const revenue = pipe(
  orders,
  filter((o) => o.status === "completed"),
  map((o) => o.total),
  (totals) => totals.reduce((sum, total) => sum + total, 0),
  (sum) => Math.round(sum * 1.1 * 100) / 100,
)
console.log(`Revenue: ${revenue}`)

// More complex pipeline
const result = pipe(
  "  Hello, World!  ",
  (s) => s.trim(),
  (s) => s.toLowerCase(),
  (s) => s.replace(/[^a-z0-9\s]/g, ""),
  (s) => s.split(/\s+/),
  (parts) => parts.join("-"),
)
// => "hello-world"
