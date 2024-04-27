# koishi-plugin-feedback

## 指令：feedback

- 基本语法：`feedback <message>`
- 选项：
  - `-r, --receive` 添加到反馈频道列表 (需要 3 级权限)
  - `-R` 从反馈频道列表移除 (需要 3 级权限)

feedback 指令用于向开发者反馈信息。当有人调用 feedback 指令时，传入的 message 就会自动被发送给所有监听反馈的频道。你可以直接回复收到的反馈信息，机器人会把这些消息重新发回到调用 feedback 指令的上下文。这里的用法类似于 [消息转发](./forward.md)。

<chat-panel>
<chat-message nickname="Koishi">
<p>收到来自 Alice 的反馈信息：</p>
<p>我也不知道该写什么总之这是一句话</p>
</chat-message>
<chat-message nickname="Operator" color="#f4a460">
<blockquote>
<p>收到来自 Alice 的反馈信息：</p>
<p>我也不知道该写什么总之这是一句话</p>
</blockquote>
<p>那么这是一句回复</p>
</chat-message>
</chat-panel>

要管理接收反馈的频道，你可以使用 `-r` 和 `-R` 选项。在任何频道中使用 `-r` 选项，都会将该频道添加到反馈频道列表中；使用 `-R` 选项，会将该频道从反馈频道列表中移除。

## 配置项

### replyTimeout

- 类型：`number`
- 默认值：`Time.day`

反馈回复时限 (单位毫秒)。
