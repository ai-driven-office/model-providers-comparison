from dataclasses import dataclass
from returns.result import Result

@dataclass(frozen=True, slots=True)
class Unauthorized: pass

@dataclass(frozen=True, slots=True)
class InvalidItems: pass

@dataclass(frozen=True, slots=True)
class PaymentFailed: pass

@dataclass(frozen=True, slots=True)
class OrderFailed:
    message: str

type CreateOrderError = (
    Unauthorized
    | InvalidItems
    | PaymentFailed
    | OrderFailed
)

def confirm(user: User, order: Order) -> Order:
    send_confirmation(user, order)
    return order

def create_order(
    params: OrderParams,
) -> Result[Order, CreateOrderError]:
    return Result.do(
        confirm(user, order)
        for user in authenticate(params.token).alt(
            lambda _: Unauthorized()
        )
        for items in validate_items(params.items).alt(
            lambda _: InvalidItems()
        )
        for payment in charge_card(user, items).alt(
            lambda _: PaymentFailed()
        )
        for order in save_order(user, items, payment).alt(
            lambda message: OrderFailed(message)
        )
    )
