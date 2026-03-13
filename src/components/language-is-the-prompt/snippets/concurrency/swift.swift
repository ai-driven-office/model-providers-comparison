// Swift: actor keyword (closest to GenServer)
actor Counter {
  private var count: Int

  init(initial: Int = 0) {
    self.count = initial
  }

  func increment() -> Int {
    count += 1
    return count
  }

  func get() -> Int {
    return count
  }
}

// Usage: automatically thread-safe
let counter = Counter(initial: 0)
await counter.increment()  // => 1
await counter.increment()  // => 2
await counter.get()        // => 2
