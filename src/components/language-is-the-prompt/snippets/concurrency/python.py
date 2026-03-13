import asyncio
from dataclasses import dataclass

@dataclass(frozen=True, slots=True)
class Increment:
    reply: asyncio.Future[int]

@dataclass(frozen=True, slots=True)
class Get:
    reply: asyncio.Future[int]

type Command = Increment | Get

class Counter:
    def __init__(self, initial: int = 0):
        self._mailbox: asyncio.Queue[Command] = asyncio.Queue()
        self._task = asyncio.create_task(self._run(initial))

    async def _run(self, count: int) -> None:
        while True:
            command = await self._mailbox.get()
            match command:
                case Increment(reply):
                    count += 1
                    reply.set_result(count)
                case Get(reply):
                    reply.set_result(count)

    async def increment(self) -> int:
        reply = asyncio.get_running_loop().create_future()
        await self._mailbox.put(Increment(reply))
        return await reply

    async def get(self) -> int:
        reply = asyncio.get_running_loop().create_future()
        await self._mailbox.put(Get(reply))
        return await reply

counter = Counter(0)
await counter.increment()  # => 1
await counter.increment()  # => 2
await counter.get()        # => 2
