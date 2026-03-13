type command interface{ isCommand() }

type increment struct{ reply chan int }
func (increment) isCommand() {}

type get struct{ reply chan int }
func (get) isCommand() {}

type Counter struct {
  mailbox chan command
}

func NewCounter(initial int) *Counter {
  mailbox := make(chan command)

  go func() {
    count := initial
    for command := range mailbox {
      switch msg := command.(type) {
      case increment:
        count++
        msg.reply <- count
      case get:
        msg.reply <- count
      }
    }
  }()

  return &Counter{mailbox: mailbox}
}

func (c *Counter) Increment() int {
  reply := make(chan int)
  c.mailbox <- increment{reply: reply}
  return <-reply
}

func (c *Counter) Get() int {
  reply := make(chan int)
  c.mailbox <- get{reply: reply}
  return <-reply
}

counter := NewCounter(0)
counter.Increment() // => 1
counter.Increment() // => 2
counter.Get()       // => 2
