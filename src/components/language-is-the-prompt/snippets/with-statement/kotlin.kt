import arrow.core.Either
import arrow.core.raise.either
import arrow.core.raise.withError

sealed interface CreateOrderError
data object Unauthorized : CreateOrderError
data object InvalidItems : CreateOrderError
data object PaymentFailed : CreateOrderError
data class OrderFailed(val message: String) : CreateOrderError

fun createOrder(
  params: OrderParams,
): Either<CreateOrderError, Order> = either {
  val user = withError({ Unauthorized }) {
    authenticate(params.token).bind()
  }
  val items = withError({ InvalidItems }) {
    validateItems(params.items).bind()
  }
  val payment = withError({ PaymentFailed }) {
    chargeCard(user, items).bind()
  }
  val order = withError(::OrderFailed) {
    saveOrder(user, items, payment).bind()
  }

  sendConfirmation(user, order)
  order
}
