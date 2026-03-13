using System.Threading.Channels;

abstract record Command;
sealed record Increment(TaskCompletionSource<int> Reply) : Command;
sealed record Get(TaskCompletionSource<int> Reply) : Command;

sealed class Counter
{
    private readonly Channel<Command> _mailbox = Channel.CreateUnbounded<Command>();

    public Counter(int initial = 0)
    {
        _ = Run(initial);
    }

    private async Task Run(int count)
    {
        await foreach (var command in _mailbox.Reader.ReadAllAsync())
        {
            switch (command)
            {
                case Increment(var reply):
                    reply.SetResult(++count);
                    break;
                case Get(var reply):
                    reply.SetResult(count);
                    break;
            }
        }
    }

    public async ValueTask<int> IncrementAsync()
    {
        var reply = new TaskCompletionSource<int>(TaskCreationOptions.RunContinuationsAsynchronously);
        await _mailbox.Writer.WriteAsync(new Increment(reply));
        return await reply.Task;
    }

    public async ValueTask<int> GetAsync()
    {
        var reply = new TaskCompletionSource<int>(TaskCreationOptions.RunContinuationsAsynchronously);
        await _mailbox.Writer.WriteAsync(new Get(reply));
        return await reply.Task;
    }
}

var counter = new Counter(0);
await counter.IncrementAsync(); // => 1
await counter.IncrementAsync(); // => 2
await counter.GetAsync();       // => 2
