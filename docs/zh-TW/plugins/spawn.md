# koishi-plugin-spawn

使用 Koishi 运行终端命令。

## 功能展示

<chat-panel>
<chat-message nickname="Alice">exec echo hello</chat-message>
<chat-message nickname="Koishi">[运行开始] echo hello</chat-message>
<chat-message nickname="Koishi">[运行完毕] echo hello<br/>hello</chat-message>
</chat-panel>

## 配置项

### root

- 类型：`string`
- 默认值：Koishi 应用目录

工作路径。

### shell

- 类型：`string`

运行命令的程序。

### encoding

- 类型：`string`
- 默认值：`utf8`

输出内容编码。如果您的系统文本编码不是 `utf8`，可以修改此项以避免乱码。

### timeout

- 类型：`number`
- 默认值：`60000`

最长运行时间 (毫秒)。超时后将会强制终止进程。
