import 'dart:isolate';

sealed class CounterCommand {
  const CounterCommand(this.replyTo);
  final SendPort replyTo;
}

final class Increment extends CounterCommand {
  const Increment(super.replyTo);
}

final class Get extends CounterCommand {
  const Get(super.replyTo);
}

Future<SendPort> startCounter([int initial = 0]) async {
  final ready = ReceivePort();
  await Isolate.spawn(_counterLoop, (initial, ready.sendPort));
  return await ready.first as SendPort;
}

void _counterLoop((int, SendPort) args) {
  final (initial, readyTo) = args;
  var count = initial;
  final mailbox = ReceivePort();
  readyTo.send(mailbox.sendPort);

  mailbox.listen((message) {
    switch (message) {
      case Increment(replyTo: final replyTo):
        count += 1;
        replyTo.send(count);
      case Get(replyTo: final replyTo):
        replyTo.send(count);
    }
  });
}

Future<int> increment(SendPort counter) async {
  final reply = ReceivePort();
  counter.send(Increment(reply.sendPort));
  final value = await reply.first as int;
  reply.close();
  return value;
}

Future<int> get(SendPort counter) async {
  final reply = ReceivePort();
  counter.send(Get(reply.sendPort));
  final value = await reply.first as int;
  reply.close();
  return value;
}

final counter = await startCounter(0);
await increment(counter); // => 1
await increment(counter); // => 2
await get(counter);       // => 2
