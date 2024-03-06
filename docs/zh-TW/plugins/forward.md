# koishi-plugin-forward

koishi-plugin-forward 支持在不同的频道之间转发消息。它有两种使用方法：

## 无数据库模式

当没有加载数据库服务时，你需要手动提供转发规则数组。

```yaml title=koishi.yml
plugins:
  forward:
    # 请使用 {platform}:{channelId} 的格式
    - source: qq:123456789
      target: discord:987654321
      selfId: '33557799'
```

当用户 Alice 在频道 `source` 中发送消息 foo 的时候，`selfId` 对应的机器人就会在频道 `target` 中发送如下的内容。接着，频道 `target` 中的用户 Bob 也可以通过引用回复这条消息的方式将自己想说的话发回到频道 `source` 中去。

<chat-panel>
<chat-message nickname="Koishi">
<p>Alice: foo</p>
</chat-message>
<chat-message nickname="Bob">
<blockquote><p>Alice: foo</p></blockquote>
<p>bar</p>
</chat-message>
</chat-panel>

## 有数据库模式

如果已经加载了数据库服务，那么上述规则列表将失效。此时插件会提供指令来管理转发规则。

| 指令语法                             | 简写形式        | 功能描述     |
| -------------------------------- | ----------- | -------- |
| `forward add <channel>`    | `fwd add`   | 添加目標頻道   |
| `forward remove <channel>` | `fwd rm`    | 移除目標頻道   |
| `forward clear`                  | `fwd clear` | 移除全部目標頻道 |
| `forward list`                   | `fwd ls`    | 查看目標頻道列表 |

::: warning
上述 `<channel>` 的语法是 `#{platform}:{channelId}`，前置的 `#` 字符不可忽略，请注意与配置项的不同。
:::

## 配置项

### storage

- 类型：`'database' | 'config'`
- 默认值：`'config'`

转发规则的存储方式。

### rules

- 类型：`Rule[]`

转发规则列表。详见 [转发规则](#转发规则)。

### replyTimeout

- 类型：`number`
- 默认值：`3600000`

转发消息不再响应回复的时间 (毫秒)。

## 转发规则

### rule.source

- 类型：`string`
- 必须参数

来源频道。

### rule.target

- 类型：`string`
- 必须参数

目标频道。

### rule.selfId

- 类型：`string`
- 必须参数

负责推送的机器人账号。

### rule.guildId

- 类型：`string`
- 必须参数

目标频道的群组编号。
