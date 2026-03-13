import { Effect, Schema, ServiceMap } from "effect"

class NotFound extends Schema.TaggedErrorClass<NotFound>()(
  "NotFound",
  { userId: Schema.Number },
) {}

class UpdateFailed extends Schema.TaggedErrorClass<UpdateFailed>()(
  "UpdateFailed",
  { message: Schema.String },
) {}

class UserRepo extends ServiceMap.Service<UserRepo, {
  getById(userId: number): Effect.Effect<User | null>
  updateEmail(user: User, newEmail: string): Effect.Effect<User, string>
}>()("example/UserRepo") {}

const fetchUser = Effect.fn("fetchUser")(function*(userId: number) {
  const repo = yield* UserRepo
  const user = yield* repo.getById(userId)
  if (!user) {
    return yield* new NotFound({ userId })
  }
  return user
})

const persistEmail = Effect.fn("persistEmail")(function*(
  user: User,
  newEmail: string,
) {
  const repo = yield* UserRepo
  return yield* repo.updateEmail(user, newEmail).pipe(
    Effect.mapError((message) => new UpdateFailed({ message })),
  )
})

const updateEmail = (userId: number, newEmail: string) =>
  Effect.gen(function* () {
    const user = yield* fetchUser(userId)
    return yield* persistEmail(user, newEmail)
  })

const program = updateEmail(42, "new@example.com").pipe(
  Effect.catchTags({
    NotFound: () => Effect.succeed(fallback),
  }),
)
