# koishi-plugin-respondent

自动回复插件，允许设置一套自定义问答规则。

如果想要通过指令设置和管理问答，以及更多的功能，可以使用 [koishi-plugin-dialogue](https://dialogue.koishi.chat)。

## 配置项

### rules[].match

- 类型: `string`
- 必需参数

要匹配的输入。

### rules[].reply

- 类型: `string`
- 必需参数

要回复的内容。

### rules[].regexp

- 类型: `boolean`

是否使用正则表达式匹配。
