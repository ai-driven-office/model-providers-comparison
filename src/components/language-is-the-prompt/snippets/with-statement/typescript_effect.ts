import { Effect, Schema } from "effect"

class Unauthorized extends Schema.TaggedErrorClass<Unauthorized>()(
  "Unauthorized",
  {},
) {}

class InvalidItems extends Schema.TaggedErrorClass<InvalidItems>()(
  "InvalidItems",
  {},
) {}

class PaymentFailed extends Schema.TaggedErrorClass<PaymentFailed>()(
  "PaymentFailed",
  {},
) {}

class OrderFailed extends Schema.TaggedErrorClass<OrderFailed>()(
  "OrderFailed",
  { message: Schema.String },
) {}

const createOrder = Effect.fn("createOrder")(function*(params: OrderParams) {
  const user = yield* authenticate(params.token).pipe(
    Effect.orElseFail(() => new Unauthorized({})),
  )
  const items = yield* validateItems(params.items).pipe(
    Effect.orElseFail(() => new InvalidItems({})),
  )
  const payment = yield* chargeCard(user, items).pipe(
    Effect.orElseFail(() => new PaymentFailed({})),
  )
  const order = yield* saveOrder(user, items, payment).pipe(
    Effect.mapError((message) => new OrderFailed({ message })),
  )

  yield* sendConfirmation(user, order)
  return order
})
