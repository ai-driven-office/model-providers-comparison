def fetch_user(id) do
  case Repo.get(User, id) do
    nil   -> {:error, :not_found}
    user  -> {:ok, user}
  end
end

def update_email(user_id, new_email) do
  with {:ok, user}    <- fetch_user(user_id),
       {:ok, updated} <-
         User.changeset(user, %{email: new_email})
                         |> Repo.update() do
    {:ok, updated}
  else
    {:error, :not_found} -> {:error, "User not found"}
    {:error, changeset}  -> {:error, format_errors(changeset)}
  end
end
