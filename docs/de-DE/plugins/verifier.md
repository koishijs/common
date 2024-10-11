# koishi-plugin-verifier

koishi-plugin-verifier 可用于处理机器人接收到的各类申请。

## 可选行为

RequestHandler 可以包含以下行为：

- 无操作，可留待人工判断
- 通过全部此类申请
- 拒绝全部此类申请
- 当申请者打到某个权限等级时通过，否则无操作 (需要额外填写这里的权限等级)

你可以在配置界面的下拉菜单中选择其中的行为。

## 配置项

### onFriendRequest

- 类型: [`RequestHandler`](#可选行为)

如何响应好友请求？

### onGuildMemberRequest

- 类型: [`RequestHandler`](#可选行为)

如何响应入群申请？

### onGuildRequest

- 类型: [`RequestHandler`](#可选行为)

如何响应入群邀请？
