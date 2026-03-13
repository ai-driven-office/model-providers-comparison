# Canonical built-in formatter: mix format
def build_user(name, email, admin?) do
  %{
    name: String.trim(name),
    email: email |> String.trim() |> String.downcase(),
    admin?: admin?,
    tags: ["active", if(admin?, do: "staff", else: "member")]
  }
end
