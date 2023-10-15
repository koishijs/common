import { App } from 'koishi'
import * as feedback from '../src'
import mock from '@koishijs/plugin-mock'
import * as jest from 'jest-mock'
import { expect, use } from 'chai'
import shape from 'chai-shape'

use(shape)

const app = new App()

app.plugin(mock)
app.plugin(feedback, {
  receivers: [{
    platform: 'mock',
    selfId: app.bots[0].selfId,
    channelId: 'private:999',
  }],
})

const client = app.mock.client('123')

before(() => app.start())
after(() => app.stop())

describe('koishi-plugin-feedback', () => {
  it('basic support', async () => {
    const send1 = app.bots[0].sendMessage = jest.fn(async () => ['1000'])
    await client.shouldReply('feedback', '请输入要发送的文本。')
    expect(send1.mock.calls).to.have.length(0)
    await client.shouldReply('feedback foo', '反馈信息发送成功！')
    expect(send1.mock.calls).to.have.length(1)
    expect(send1.mock.calls).to.have.shape([['private:999', '收到来自 123 的反馈信息：\nfoo']])

    const send2 = app.bots[0].sendMessage = jest.fn(async () => ['2000'])
    await client.shouldNotReply('bar')
    expect(send2.mock.calls).to.have.length(0)
    await client.shouldNotReply(`<quote id="1000"/> bar`)
    expect(send2.mock.calls).to.have.length(1)
    expect(send2.mock.calls).to.have.shape([['private:123', 'bar']])
  })
})
