import { App } from 'koishi'
import * as alias from '../src'
import * as echo from '@koishijs/plugin-echo'
import mock from '@koishijs/plugin-mock'

const app = new App()

app.plugin(echo)
app.plugin(mock)
app.plugin(alias)

const client = app.mock.client('123')

before(() => app.start())
after(() => app.stop())

describe('koishi-plugin-feedback', () => {
  it('basic support', async () => {
    await client.shouldReply('alias foo echo 111', '已成功创建别名指令 foo。')
    await client.shouldReply('foo 222', '111 222')
    await client.shouldReply('alias foo echo 111', '已成功更新别名指令 foo。')

    await client.shouldReply('unalias foo', '已成功删除别名指令 foo。')
    await client.shouldNotReply('foo 222')
    await client.shouldReply('unalias foo', '未找到别名指令 foo。')
  })
})
