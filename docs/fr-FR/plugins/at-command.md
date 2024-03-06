# koishi-plugin-at-command

koishi-plugin-at-command 可用于在有人发送「@机器人」时触发特定指令。

<chat-panel>
<chat-message nickname="Alice">@Koishi</chat-message>
<chat-message nickname="Koishi">
  <p>当前可用的指令有：</p>
  <p>……</p>
</chat-message>
</chat-panel>

## 配置项

### config.execute

- 类型：`string`
- 默认值：`'help'`

要调用的指令。

## 替代方案

可以使用 [koishi-plugin-dialogue](https://dialogue.koishi.chat/zh-CN/) 实现此插件的全部功能。
