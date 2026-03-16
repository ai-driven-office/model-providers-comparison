import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.launch

sealed interface Command
data class Increment(val reply: CompletableDeferred<Int>) : Command
data class Get(val reply: CompletableDeferred<Int>) : Command
data class Stop(val reply: CompletableDeferred<Unit>) : Command

class Counter(scope: CoroutineScope, initial: Int = 0) {
    private val mailbox = Channel<Command>(Channel.UNLIMITED)
    private val loop = scope.launch {
        var count = initial
        for (command in mailbox) {
            when (command) {
                is Increment -> command.reply.complete(++count)
                is Get -> command.reply.complete(count)
                is Stop -> {
                    command.reply.complete(Unit)
                    return@launch
                }
            }
        }
    }

    suspend fun increment(): Int {
        val reply = CompletableDeferred<Int>()
        mailbox.send(Increment(reply))
        return reply.await()
    }

    suspend fun get(): Int {
        val reply = CompletableDeferred<Int>()
        mailbox.send(Get(reply))
        return reply.await()
    }

    suspend fun close() {
        val reply = CompletableDeferred<Unit>()
        mailbox.send(Stop(reply))
        reply.await()
        mailbox.close()
        loop.join()
    }
}

coroutineScope {
    val counter = Counter(this, 0)
    try {
        counter.increment() // => 1
        counter.increment() // => 2
        counter.get()       // => 2
    } finally {
        counter.close()
    }
}
