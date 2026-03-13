type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E }

type CreateOrderError =
  | { type: "unauthorized" }
  | { type: "invalid_items" }
  | { type: "payment_failed" }
  | { type: "order_failed"; message: string }

const createOrder = (
  params: OrderParams,
): Result<Order, CreateOrderError> => {
  const userResult = authenticate(params.token)
  if (!userResult.ok) {
    return { ok: false, error: { type: "unauthorized" } }
  }

  const itemsResult = validateItems(params.items)
  if (!itemsResult.ok) {
    return { ok: false, error: { type: "invalid_items" } }
  }

  const paymentResult = chargeCard(
    userResult.value,
    itemsResult.value,
  )
  if (!paymentResult.ok) {
    return { ok: false, error: { type: "payment_failed" } }
  }

  const orderResult = saveOrder(
    userResult.value,
    itemsResult.value,
    paymentResult.value,
  )
  if (!orderResult.ok) {
    return {
      ok: false,
      error: {
        type: "order_failed",
        message: orderResult.error,
      },
    }
  }

  sendConfirmation(userResult.value, orderResult.value)
  return orderResult
}
