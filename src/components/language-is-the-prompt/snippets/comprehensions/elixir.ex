lines = ["Alice,88", "Bob,72", "Carol,91"]

pairs =
  for x <- 1..10,
      y <- 1..10,
      x + y > 12,
      rem(x * y, 3) == 0 do
    {x, y}
  end

honor_roll =
  for line <- lines,
      [name, score_text] = String.split(line, ",", parts: 2),
      {score, ""} = Integer.parse(String.trim(score_text)),
      score > 80 do
    %{name: String.trim(name), score: score, grade: "A"}
  end
