import asyncio
from contextlib import AbstractAsyncContextManager
from dataclasses import dataclass
from typing import Self

@dataclass(frozen=True, slots=True)
class Increment:
    reply: asyncio.Future[int]

@dataclass(frozen=True, slots=True)
class Get:
    reply: asyncio.Future[int]

@dataclass(frozen=True, slots=True)
class Stop:
    reply: asyncio.Future[None]

type Command = Increment | Get | Stop

class Counter(AbstractAsyncContextManager["Counter"]):
    def __init__(self, initial: int = 0):
        self._mailbox: asyncio.Queue[Command] = asyncio.Queue()
        self._initial = initial
        self._tasks: asyncio.TaskGroup | None = None

    async def __aenter__(self) -> Self:
        self._tasks = asyncio.TaskGroup()
        await self._tasks.__aenter__()
        self._tasks.create_task(self._run(self._initial))
        return self

    async def __aexit__(self, exc_type, exc, tb) -> None:
        reply = asyncio.get_running_loop().create_future()
        await self._mailbox.put(Stop(reply))
        await reply
        assert self._tasks is not None
        await self._tasks.__aexit__(exc_type, exc, tb)

    async def _run(self, count: int) -> None:
        while True:
            command = await self._mailbox.get()
            match command:
                case Increment(reply):
                    count += 1
                    reply.set_result(count)
                case Get(reply):
                    reply.set_result(count)
                case Stop(reply):
                    reply.set_result(None)
                    return

    async def increment(self) -> int:
        reply = asyncio.get_running_loop().create_future()
        await self._mailbox.put(Increment(reply))
        return await reply

    async def get(self) -> int:
        reply = asyncio.get_running_loop().create_future()
        await self._mailbox.put(Get(reply))
        return await reply

async with Counter(0) as counter:
    await counter.increment()  # => 1
    await counter.increment()  # => 2
    await counter.get()        # => 2
