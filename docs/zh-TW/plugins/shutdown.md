# koishi-plugin-shutdown

koishi-plugin-shutdown 提供了适用于 Koishi 的 [shutdown(8)](https://www.freedesktop.org/software/systemd/man/shutdown.html)。通过指令关闭和重启机器人，支持定时和取消。

## 指令：shutdown

- 基本语法：`shutdown [time] [wall]`
- 别名：`exit`
- 最低权限：3
- 选项：
  - `-r, --reboot` 软重启
  - `-R, --reboot-hard` 硬重启
  - `-c, --clear` 清空计划中的关闭
  - `-s, --show` 列出计划中的关闭
  - `-w, --wall` 发送广播消息

shutdown 指令可用于关闭或重启 Koishi。

`-r` 和 `-R` 选项可用于重启机器人。其中软重启用于从 Koishi CLI 侧重启，硬重启用于从 Koishi Launcher (例如 Koishi Desktop 或 Koishi Android) 侧重启。

`-c` 和 `-s` 选项可用于取消或查看计划中的关闭。

当传入了 `wall` 参数或使用 `-w` 选项时，将会发送广播消息。该消息会发送给**全部** Koishi 接入的频道。
