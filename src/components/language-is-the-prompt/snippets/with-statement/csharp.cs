using CSharpFunctionalExtensions;

public abstract record CreateOrderError
{
    public sealed record Unauthorized : CreateOrderError;
    public sealed record InvalidItems : CreateOrderError;
    public sealed record PaymentFailed : CreateOrderError;
    public sealed record OrderFailed(
        string Message
    ) : CreateOrderError;
}

Result<Order, CreateOrderError> CreateOrder(
    OrderParams params
) =>
    Authenticate(params.Token)
        .MapError(
            _ =>
                (CreateOrderError)new CreateOrderError
                    .Unauthorized()
        )
        .Bind(
            user => ValidateItems(params.Items)
                .MapError(
                    _ =>
                        (CreateOrderError)new CreateOrderError
                            .InvalidItems()
                )
                .Bind(
                    items => ChargeCard(user, items)
                        .MapError(
                            _ =>
                                (CreateOrderError)new
                                    CreateOrderError.PaymentFailed()
                        )
                        .Bind(
                            payment =>
                                SaveOrder(user, items, payment)
                                .MapError(
                                    message =>
                                        (CreateOrderError)new
                                            CreateOrderError.OrderFailed(
                                                message
                                            )
                                )
                                .Tap(
                                    order =>
                                        SendConfirmation(
                                            user,
                                            order
                                        )
                                )
                        )
                )
        );
