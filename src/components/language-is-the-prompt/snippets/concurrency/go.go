type command interface{ isCommand() }

type increment struct{ reply chan int }
func (increment) isCommand() {}

type get struct{ reply chan int }
func (get) isCommand() {}

type stop struct{ done chan struct{} }
func (stop) isCommand() {}

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
      case stop:
        close(msg.done)
        return
      }
    }
  }()

  return &Counter{mailbox: mailbox}
}

func (c *Counter) Increment() int {
  reply := make(chan int, 1)
  c.mailbox <- increment{reply: reply}
  return <-reply
}

func (c *Counter) Get() int {
  reply := make(chan int, 1)
  c.mailbox <- get{reply: reply}
  return <-reply
}

func (c *Counter) Close() {
  done := make(chan struct{})
  c.mailbox <- stop{done: done}
  <-done
  close(c.mailbox)
}

counter := NewCounter(0)
defer counter.Close()
counter.Increment() // => 1
counter.Increment() // => 2
counter.Get()       // => 2
