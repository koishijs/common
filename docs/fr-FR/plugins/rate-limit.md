# koishi-plugin-rate-limit

::: tip
要使用本插件，你需要安装数据库支持，并配合 [@koishijs/plugin-commands](https://koishi.chat/manual/usage/command.html#指令管理) 使用。
:::

koishi-plugin-rate-limit 可用于限制指令调用频率。

## 基本用法

安装此插件后，控制台的「指令管理」页面将会增加一些配置项。

有些指令 (例如签到抽卡，限制次数的 API 调用等) 我们并不希望被无限调用，这时我们可以通过 `maxUsage` 设置每天访问额度的上限。当超出总次数后，机器人将回复「调用次数已达上限」。

另一些指令 (例如高强度刷屏，需要等待一定时间才有结果的功能) 我们并不希望被短时间内重复调用，这时我们可以通过 `minInterval` 设置最短触发间隔。如果一个处于冷却中的指令再次被调用，机器人将会提示「调用过于频繁，请稍后再试」。

如果你希望某些选项不计入总次数，可以使用选项配置中的 `notUsage`。启用此项后，当指令调用含有对应的选项时，将不会收到 `maxUsage` 和 `minInterval` 的限制。

最后，如果我们希望让多个指令共同同一套速率限制，可以通过 `usageName` 来进行管理。只需将这些指令的 `usageName` 设置为相同的值即可。

## 扩展用户字段

- **usage:** `Record<string, number>` 指令调用次数
- **timers:** `Record<string, number>` 指令调用时间

## 指令：user.usage / user.timer

- 基本语法：`user.xxx [key] [value]`
- 选项：
  - `-s, --set` 设置访问记录（需要 4 级权限）
  - `-c, --clear` 清除访问记录（需要 4 级权限）
  - `-t, --target [@user]` 目标用户（需要 3 级权限）

如果不提供 `-s` 和 `-c` 选项，则会显示当前的访问记录。如果使用了 `-s`，就会设置名为 `key` 的访问记录为 `value`。如果使用了 `-c` 且提供了 `key`，就会清除名为 `key` 的访问记录；否则会清除所有的访问记录。
