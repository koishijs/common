# koishi-plugin-schedule

koishi-plugin-schedule 用于在用户侧设置计划任务。

::: tip
如果想要在开发者侧设置计划任务，可以使用 [koishi-plugin-cron](https://cron.koishi.chat)。
:::

<chat-panel>
<chat-message nickname="Alice">schedule 1m -- echo 233</chat-message>
<chat-message nickname="Koishi">日程已创建，编号为 1。</chat-message>
<chat-message nickname="Alice">schedule -l</chat-message>
<chat-message nickname="Koishi">1. 今天 10:01：echo 233</chat-message>
<p>——— 1 分钟后 ———</p>
<chat-message nickname="Koishi">233</chat-message>
</chat-panel>

## 指令：schedule

添加或查找计划任务。

- 基本语法：`schedule [time] -- [command]`
- 选项列表：
  - `/ <interval>` 设置触发的间隔秒数
  - `-l, --list` 查看已经设置的日程
  - `-e, --ensure` 错过时间也确保执行
  - `-f, --full` 查找全部上下文
  - `-d, --delete <id>` 删除已经设置的日程

### 定时器语法

- `1m`: 1 分钟后触发
- `2h30m`: 2 小时 30 分钟后触发
- `10:00`: 今天 10 点触发
- `1m / 10s`: 1 分钟后每隔 10 秒触发
- `10:00 / 1d`: 从今天起每天 10 点触发

## 配置项

### minInterval

- 类型: `number`
- 默认值: `60000`

允许的最短时间间隔，单位为毫秒。如果传入的 interval 参数小于这个值，将会提示“时间间隔过短”。
