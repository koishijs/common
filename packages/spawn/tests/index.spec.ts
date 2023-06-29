import { Context } from 'koishi'
import mock from '@koishijs/plugin-mock'
import * as spawn from '../src'

const ctx = new Context()
ctx.plugin(mock)
ctx.plugin(spawn)

const client = ctx.mock.client('123')

describe('koishi-plugin-spawn', () => {
  before(() => ctx.start())
  after(() => ctx.stop())

  it('basic support', async () => {
    await client.shouldReply('exec echo hello', [
      '[运行开始] echo hello',
      '[运行完毕] echo hello\nhello',
    ])
  })
})
