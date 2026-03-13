import { Deferred, Effect, Mailbox, Match, Stream } from "effect"

type Command =
  | { readonly _tag: "Increment"; readonly reply: Deferred.Deferred<number> }
  | { readonly _tag: "Get"; readonly reply: Deferred.Deferred<number> }

const makeCounter = (initial = 0) =>
  Effect.scoped(
    Effect.gen(function* () {
      const mailbox = yield* Mailbox.make<Command>()

      yield* Effect.addFinalizer(() => mailbox.end)

      yield* Mailbox.toStream(mailbox).pipe(
        Stream.runFoldEffect(initial, (count, command) =>
          Match.value(command).pipe(
            Match.tag("Increment", ({ reply }) => {
              const next = count + 1
              return Deferred.succeed(reply, next).pipe(Effect.as(next))
            }),
            Match.tag("Get", ({ reply }) =>
              Deferred.succeed(reply, count).pipe(Effect.as(count))),
            Match.exhaustive,
          ),
        ),
        Effect.forkScoped,
      )

      const ask = (build: (reply: Deferred.Deferred<number>) => Command) =>
        Effect.gen(function* () {
          const reply = yield* Deferred.make<number>()
          yield* mailbox.offer(build(reply))
          return yield* Deferred.await(reply)
        })

      return {
        increment: ask((reply) => ({ _tag: "Increment", reply })),
        get: ask((reply) => ({ _tag: "Get", reply })),
      } as const
    }),
  )

const program = Effect.gen(function* () {
  const counter = yield* makeCounter(0)
  yield* counter.increment // => 1
  yield* counter.increment // => 2
  return yield* counter.get // => 2
})
