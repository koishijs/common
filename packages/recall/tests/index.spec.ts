import { App } from 'koishi'
import { expect, use } from 'chai'
import mock from '@koishijs/plugin-mock'
import * as jest from 'jest-mock'
import * as recall from '../src'
import shape from 'chai-shape'

use(shape)

const app = new App()

app.plugin(mock)
app.plugin(recall)

const client = app.mock.client('123', '456')

before(() => app.start())
after(() => app.stop())

describe('koishi-plugin-recall', () => {
  it('basic support', async () => {
    const del = app.bots[0].deleteMessage = jest.fn(async () => {})
    await client.shouldReply('recall', '近期没有发送消息。')
    app.mock.receive({
      type: 'send',
      message: { id: '1234' },
      channel: { id: '456', type: 0 },
      guild: { id: '456' },
      user: { id: '123' },
    })
    await client.shouldNotReply('recall')
    expect(del.mock.calls).to.have.shape([[client.event.channel?.id, '1234']])
  })

  it('reply', async () => {
    const del = app.bots[0].deleteMessage = jest.fn(async () => {})
    app.mock.receive({
      type: 'send',
      message: { id: '114' },
      channel: { id: '514', type: 0 },
      guild: { id: '1919' },
      user: { id: '123' },
    })
    await client.shouldNotReply('<quote id="114"/>recall')
    expect(del.mock.calls).to.have.shape([[client.event.channel?.id, '114']])
  })
})
