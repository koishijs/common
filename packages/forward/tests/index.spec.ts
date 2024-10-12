import { App } from 'koishi'
import { expect, use } from 'chai'
import shape from 'chai-shape'
import { mock as jest } from 'node:test'
import * as help from '@koishijs/plugin-help'
import memory from '@koishijs/plugin-database-memory'
import mock, { DEFAULT_SELF_ID } from '@koishijs/plugin-mock'
import * as forward from '../src'

use(shape)

const app = new App()

app.plugin(mock)
app.plugin(help)

const client2 = app.mock.client('123', '456')
const client3 = app.mock.client('789', '654')

const fork = app.plugin(forward, {
  rules: [{
    source: 'mock:456',
    target: 'mock:654',
    selfId: DEFAULT_SELF_ID,
  }],
})

const send = app.bots[0].sendMessage = jest.fn(async () => ['2000'])
app.bots[0].getGuildMemberList = jest.fn(async () => ({
  data: [{ user: { id: '321', name: 'foo' } }],
}))

before(() => app.start())
after(() => app.stop())

describe('koishi-plugin-forward', () => {
  it('basic support', async () => {
    send.mock.resetCalls()
    await client2.shouldNotReply('hello')
    expect(send.mock.calls).to.have.length(1)
    expect(send.mock.calls[0].arguments).to.have.shape(['654', '123: hello'])

    send.mock.resetCalls()
    await client3.shouldNotReply('hello')
    expect(send.mock.calls).to.have.length(0)
    await client3.shouldNotReply('<quote id="2000"/> hello')
    expect(send.mock.calls).to.have.length(1)
    expect(send.mock.calls[0].arguments).to.have.shape(['456', '789: hello'])

    send.mock.resetCalls()
    send.mock.mockImplementation(async () => ['3000'])
    await client2.shouldNotReply('<quote id="3000"/> hello')
    expect(send.mock.calls).to.have.length(1)
    expect(send.mock.calls[0].arguments).to.have.shape(['654', '123: hello'])
  })

  it('command usage', async () => {
    app.plugin(memory)
    fork.update({ mode: 'database' })
    await app.lifecycle.flush()
    await app.mock.initUser('123', 3)
    await app.mock.initChannel('456')
    await app.mock.initChannel('654')

    await client2.shouldReply('forward', /设置消息转发/)
    await client2.shouldReply('forward add #654', '已成功添加目标频道 mock:654。')
    await client2.shouldReply('forward ls', '当前频道的目标频道列表为：\nmock:654')

    send.mock.resetCalls()
    await client2.shouldNotReply('hello <at id="321"/>')
    expect(send.mock.calls).to.have.length(1)
    expect(send.mock.calls[0].arguments).to.have.shape(['654', '123: hello @foo'])

    await client2.shouldReply('forward rm #654', '已成功移除目标频道 mock:654。')
    await client2.shouldReply('forward ls', '当前频道没有设置目标频道。')
    await client2.shouldReply('forward clear', '已成功移除全部目标频道。')
  })
})
