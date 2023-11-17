import { App } from 'koishi'
import * as at from '../src'
import * as help from '@koishijs/plugin-help'
import mock from '@koishijs/plugin-mock'

const app = new App()

app.plugin(mock)
app.plugin(help)
app.plugin(at)

const client = app.mock.client('123')

before(() => app.start())
after(() => app.stop())

describe('koishi-plugin-at-command', () => {
  it('basic support', async () => {
    await client.shouldReply('<at id="514"/> <at id="999"/> \n', /当前可用的指令有/)
    await client.shouldReply('<at id="999"/> <at id="514"/> \n', /当前可用的指令有/)
    await client.shouldNotReply('<at id="999"/>')
    await client.shouldNotReply('<at id="514"/> test')
  })
})
