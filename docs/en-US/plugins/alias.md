# koishi-plugin-alias

koishi-plugin-alias 可用于创建和删除别名指令。

## 基本用法

<chat-panel>
<chat-message nickname="Alice">
  <p>alias about echo</p>
  <p>Koishi is a cross-platform, extensive, high-performance chatbot framework.</p>
  <p>官方网站：https://koishi.chat</p>
</chat-message>
<chat-message nickname="Koishi">已成功创建别名指令 about。</chat-message>
<chat-message nickname="Alice">about</chat-message>
<chat-message nickname="Koishi">
  <p>Koishi is a cross-platform, extensive, high-performance chatbot framework.</p>
  <p>官方网站：https://koishi.chat</p>
</chat-message>
</chat-panel>

### 指令：alias

- 基本语法：`alias <name> <command>`

alias 指令用于创建别名指令。

### 指令：unalias

- 基本语法：`unalias <name>`

unalias 指令用于删除别名指令。

## 功能对比

一些其他插件也可以实现类似的功能，但是它们之间有一些区别。

### commands

[@koishijs/plugin-commands](https://koishi.chat/zh-CN/plugins/console/commands.html) 插件提供了 `command` 指令，可以通过 `--alias` 和 `--unalias` 选项来创建和删除别名。与本插件的区别在于，commands 插件创建的只是已有指令的别名，必须依附于某一条指令存在；而本插件创建的指令是独立存在的，因此可以实现多指令的顺序或嵌套调用，在使用上更加灵活。

当然，@koishijs/plugin-commands 还提供了其他能力，例如修改父指令、修改指令配置等。你可以同时使用两个插件，以便充分发挥它们的功能。

### dialogue

[koishi-plugin-dialogue](https://dialogue.koishi.chat/zh-CN/) 插件功能十分强大。借助于其自带的指令插值语法，本插件所能实现的功能它都能实现。不过它的语法更复杂，且依赖数据库服务。
