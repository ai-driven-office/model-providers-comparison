enum CreateOrderError: Error {
  case unauthorized
  case invalidItems
  case paymentFailed
  case orderFailed(String)
}

func createOrder(
  _ params: OrderParams
) throws(CreateOrderError) -> Order {
  let user = try authenticate(params.token)
    .mapError { _ in .unauthorized }
    .get()

  let items = try validateItems(params.items)
    .mapError { _ in .invalidItems }
    .get()

  let payment = try chargeCard(user, items)
    .mapError { _ in .paymentFailed }
    .get()

  let order = try saveOrder(user, items, payment)
    .mapError { .orderFailed($0.localizedDescription) }
    .get()

  sendConfirmation(user, order)
  return order
}
