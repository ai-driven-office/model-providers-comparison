import (
  "errors"
  "fmt"
)

var (
  ErrUnauthorized = errors.New("please log in")
  ErrInvalidItems = errors.New("invalid cart")
  ErrPaymentFailed = errors.New("payment declined")
)

func createOrder(params OrderParams) (Order, error) {
  user, err := authenticate(params.Token)
  if err != nil {
    return Order{}, ErrUnauthorized
  }

  items, err := validateItems(params.Items)
  if err != nil {
    return Order{}, ErrInvalidItems
  }

  payment, err := chargeCard(user, items)
  if err != nil {
    return Order{}, ErrPaymentFailed
  }

  order, err := saveOrder(user, items, payment)
  if err != nil {
    return Order{}, fmt.Errorf("order failed: %w", err)
  }

  sendConfirmation(user, order)
  return order, nil
}
