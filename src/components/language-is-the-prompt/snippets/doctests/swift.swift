// Source-backed docs:
// DocC publishes snippets from real files, not inline doctests.
// Documentation.docc/SafeAdd.md
// @Snippet(path: "SafeAddSnippet")

// Snippets/SafeAddSnippet.swift
import MathKit

let ok = safeAdd(1, 2)
let overflow = safeAdd(9_999_999_999, 1)

print(ok)        // .success(3)
print(overflow)  // .failure(.overflow)

// DocC publishes the example from this real file in Snippets/
