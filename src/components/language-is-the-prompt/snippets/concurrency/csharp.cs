using System.Threading.Channels;

abstract record Command;
sealed record Increment(TaskCompletionSource<int> Reply) : Command;
sealed record Get(TaskCompletionSource<int> Reply) : Command;

sealed class Counter : IAsyncDisposable
{
    private readonly Channel<Command> _mailbox =
        Channel.CreateUnbounded<Command>(
            new UnboundedChannelOptions
            {
                SingleReader = true,
                SingleWriter = false,
            }
        );
    private readonly Task _loop;

    public Counter(int initial = 0)
    {
        _loop = Run(initial);
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

    public async ValueTask DisposeAsync()
    {
        _mailbox.Writer.TryComplete();
        await _loop;
    }
}

await using var counter = new Counter(0);
await counter.IncrementAsync(); // => 1
await counter.IncrementAsync(); // => 2
await counter.GetAsync();       // => 2
