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

readonly record struct ValidatedOrder(
    User User,
    Items Items
);

readonly record struct ChargedOrder(
    User User,
    Items Items,
    Payment Payment
);

Result<Order, CreateOrderError> CreateOrder(
    OrderParams parameters
) =>
    Authenticate(parameters.Token)
        .MapError(
            _ =>
                (CreateOrderError)new CreateOrderError
                    .Unauthorized()
        )
        .Bind(
            user => ValidateItems(parameters.Items)
                .MapError(
                    _ =>
                        (CreateOrderError)new CreateOrderError
                            .InvalidItems()
                )
                .Map(items => new ValidatedOrder(user, items))
        )
        .Bind(
            validated =>
                ChargeCard(validated.User, validated.Items)
                    .MapError(
                        _ =>
                            (CreateOrderError)new
                                CreateOrderError.PaymentFailed()
                    )
                    .Map(
                        payment =>
                            new ChargedOrder(
                                validated.User,
                                validated.Items,
                                payment
                            )
                    )
        )
        .Bind(
            charged =>
                SaveOrder(
                    charged.User,
                    charged.Items,
                    charged.Payment
                )
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
                            charged.User,
                            order
                        )
                )
        );
