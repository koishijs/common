# koishi-plugin-recall

koishi-plugin-recall 可用于在群聊中撤回已发送的消息。

## 指令：recall

- 基本语法：`recall [count]`
- 最低权限：2

recall 指令有两种用法：

1. 直接调用时，撤回机器人在当前频道发送的最后几条消息
2. 引用回复调用时，撤回引用的消息

`count` 是要撤回的消息的数量，缺省时为 1。与 broadcast 类似，为了避免风控，每撤回一条消息后 Koishi 也会等待一段时间，同样可以通过 [`delay.broadcast`](htrtps://koishi.chat/api/core/app.md#options-delay) 进行配置。

## 配置项

### timeout

- 类型：`string`
- 默认值：`Time.hour`

保存已发送消息的时间。超时的消息将被清除。
