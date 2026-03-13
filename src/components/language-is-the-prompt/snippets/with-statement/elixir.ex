def create_order(%{token: token, items: raw_items}) do
  with {:ok, user}     <- authenticate(token),
       {:ok, items}    <- validate_items(raw_items),
       {:ok, payment}  <- charge_card(user, items),
       {:ok, order}    <- save_order(user, items, payment) do
    send_confirmation(user, order)
    {:ok, order}
  else
    {:error, :unauthorized} -> {:error, "Please log in"}
    {:error, :invalid_items} -> {:error, "Invalid cart"}
    {:error, :payment_failed} -> {:error, "Payment declined"}
    {:error, reason} -> {:error, "Order failed: #{reason}"}
  end
end
