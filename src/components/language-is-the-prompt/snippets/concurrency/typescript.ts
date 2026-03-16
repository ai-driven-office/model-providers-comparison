import {
  Worker,
  isMainThread,
  parentPort,
  workerData,
} from "node:worker_threads"

type Command =
  | { type: "increment"; id: number }
  | { type: "get"; id: number }

type Reply = { id: number; value: number }

if (!isMainThread) {
  let count = workerData as number

  parentPort!.on("message", (command: Command) => {
    switch (command.type) {
      case "increment":
        count += 1
        parentPort!.postMessage(
          { id: command.id, value: count } satisfies Reply,
        )
        break
      case "get":
        parentPort!.postMessage(
          { id: command.id, value: count } satisfies Reply,
        )
        break
    }
  })
}

class Counter {
  #worker: Worker
  #nextId = 0
  #pending = new Map<number, (value: number) => void>()

  constructor(initial = 0) {
    this.#worker = new Worker(
      new URL(import.meta.url),
      { workerData: initial },
    )
    this.#worker.on("message", ({ id, value }: Reply) => {
      this.#pending.get(id)?.(value)
      this.#pending.delete(id)
    })
  }

  #ask(type: Command["type"]): Promise<number> {
    const id = this.#nextId++
    const { promise, resolve } = Promise.withResolvers<number>()
    this.#pending.set(id, resolve)
    this.#worker.postMessage({ type, id } satisfies Command)
    return promise
  }

  increment(): Promise<number> {
    return this.#ask("increment")
  }

  get(): Promise<number> {
    return this.#ask("get")
  }

  async dispose(): Promise<void> {
    await this.#worker.terminate()
  }
}

const counter = new Counter(0)
try {
  await counter.increment() // 1
  await counter.increment() // 2
  await counter.get() // 2
} finally {
  await counter.dispose()
}
