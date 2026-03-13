import 'package:fpdart/fpdart.dart';

sealed class CreateOrderError {
  const CreateOrderError();
}

final class Unauthorized extends CreateOrderError {
  const Unauthorized();
}

final class InvalidItems extends CreateOrderError {
  const InvalidItems();
}

final class PaymentFailed extends CreateOrderError {
  const PaymentFailed();
}

final class OrderFailed extends CreateOrderError {
  const OrderFailed(this.message);
  final String message;
}

TaskEither<CreateOrderError, Order> createOrder(
  OrderParams params,
) =>
  TaskEither.Do((_) async {
    final user = await _(
      authenticate(params.token).mapLeft(
        (_) => const Unauthorized(),
      ),
    );
    final items = await _(
      validateItems(params.items).mapLeft(
        (_) => const InvalidItems(),
      ),
    );
    final payment = await _(
      chargeCard(user, items).mapLeft(
        (_) => const PaymentFailed(),
      ),
    );
    final order = await _(
      saveOrder(user, items, payment).mapLeft(
        (message) => OrderFailed(message),
      ),
    );

    sendConfirmation(user, order);
    return order;
  });
