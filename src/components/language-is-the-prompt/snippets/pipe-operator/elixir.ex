# Elixir: read top-to-bottom, each step is obvious
orders
|> Enum.filter(&(&1.status == :completed))
|> Enum.map(& &1.total)
|> Enum.sum()
|> then(&(&1 * 1.1))       # add 10% tax
|> Float.round(2)
|> IO.inspect(label: "Revenue")

# More complex pipeline
"  Hello, World!  "
|> String.trim()
|> String.downcase()
|> String.replace(~r/[^a-z0-9\s]/, "")
|> String.split()
|> Enum.join("-")
# => "hello-world"
