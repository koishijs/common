import { App } from 'koishi'
import * as feedback from '../src'
import mock from '@koishijs/plugin-mock'
import { mock as jest } from 'node:test'
import { expect, use } from 'chai'
import shape from 'chai-shape'

use(shape)

const app = new App()

app.plugin(mock)
app.plugin(feedback)

const client1 = app.mock.client('123')
const client2 = app.mock.client('999')

before(() => app.start())
after(() => app.stop())

describe('koishi-plugin-feedback', () => {
  it('basic support', async () => {
    await client2.shouldReply('feedback -r', '反馈频道更新成功！')
    await client2.shouldReply('feedback -r', '反馈频道没有改动。')

    const send1 = app.bots[0].sendMessage = jest.fn(async () => ['1000'])
    await client1.shouldReply('feedback', '请输入要发送的文本。')
    expect(send1.mock.calls).to.have.length(0)
    await client1.shouldReply('feedback foo', '反馈信息发送成功！')
    expect(send1.mock.calls).to.have.length(1)
    expect(send1.mock.calls[0].arguments).to.have.shape(['private:999', '收到来自 123 的反馈信息：\nfoo'])

    const send2 = app.bots[0].sendMessage = jest.fn(async () => ['2000'])
    await client1.shouldNotReply('bar')
    expect(send2.mock.calls).to.have.length(0)
    await client1.shouldNotReply(`<quote id="1000"/> bar`)
    expect(send2.mock.calls).to.have.length(1)
    expect(send2.mock.calls[0].arguments).to.have.shape(['private:123', 'bar'])

    await client2.shouldReply('feedback -R', '反馈频道更新成功！')
    await client2.shouldReply('feedback -R', '反馈频道没有改动。')
  })
})
