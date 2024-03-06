# koishi-plugin-rate-limit

::: tip
要使用本插件，你需要安装数据库支持，并配合 [@koishijs/plugin-commands](https://koishi.chat/manual/usage/command.html#指令管理) 使用。
:::

koishi-plugin-rate-limit 可用于限制指令调用频率。

## 基本用法

安装此插件后，控制台的「指令管理」页面将会增加一些配置项。

有些指令 (例如簽到抽卡，限制次數的 API 呼叫等) 我們並不希望被無限呼叫，這時我們可以透過 `maxUsage` 設定每天訪問額度的上限。當超出總次數後，機器人將回復「呼叫次數已達上限」。

另一些指令 (例如高強度刷屏，需要等待一定時間才有結果的功能) 我們並不希望被短時間內重複呼叫，這時我們可以透過 `minInterval` 設定最短觸發間隔。如果一個處於冷卻中的指令再次被呼叫，機器人將會提示「呼叫過於頻繁，請稍後再試」。

如果你希望某些選項不計入總次數，可以使用選項配置中的 `notUsage`。啟用此項後，當指令呼叫含有對應的選項時，將不會收到 `maxUsage` 和 `minInterval` 的限制。

最後，如果我們希望讓多個指令共同同一套速率限制，可以透過 `usageName` 來進行管理。只需將這些指令的 `usageName` 設定為相同的值即可。

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
