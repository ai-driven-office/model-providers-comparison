import { type ResultAsync } from "neverthrow"

type CreateOrderError =
  | { readonly type: "unauthorized" }
  | { readonly type: "invalid_items" }
  | { readonly type: "payment_failed" }
  | { readonly type: "order_failed"; readonly message: string }

type OrderContext = {
  readonly user: User
  readonly items: Items
}

type ChargedOrderContext = OrderContext & {
  readonly payment: Payment
}

const createOrder = (
  params: OrderParams,
): ResultAsync<Order, CreateOrderError> =>
  authenticate(params.token)
    .mapErr(() => ({ type: "unauthorized" } as const))
    .andThen((user) =>
      validateItems(params.items)
        .mapErr(() => ({ type: "invalid_items" } as const))
        .map(
          (items): OrderContext => ({
            user,
            items,
          }),
        ),
    )
    .andThen(({ user, items }) =>
      chargeCard(user, items)
        .mapErr(() => ({ type: "payment_failed" } as const))
        .map(
          (payment): ChargedOrderContext => ({
            user,
            items,
            payment,
          }),
        ),
    )
    .andThen(({ user, items, payment }) =>
      saveOrder(user, items, payment)
        .mapErr(
          (message) =>
            ({
              type: "order_failed",
              message,
            }) as const,
        )
        .map((order) => {
          sendConfirmation(user, order)
          return order
        }),
    )
