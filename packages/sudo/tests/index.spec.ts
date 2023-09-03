import { App } from 'koishi'
import mock from '@koishijs/plugin-mock'
import memory from '@koishijs/plugin-database-memory'
import * as rate from 'koishi-plugin-rate-limit'
import * as sudo from '../src'

describe('koishi-plugin-sudo', () => {
  const app = new App()

  app.plugin(memory)
  app.plugin(mock)
  app.plugin(sudo)

  app.command('show-context', { authority: 2 })
    .userFields(['id'])
    .channelFields(['id'])
    .action(({ session }) => {
      return `${session!.userId},${session!.user?.id},${session!.channel?.id}`
    })

  const client1 = app.mock.client('123')
  const client2 = app.mock.client('123', '456')

  before(async () => {
    await app.start()
    await app.mock.initUser('123', 3)
    await app.mock.initUser('456', 1)
    await app.mock.initUser('789', 4)
    await app.mock.initChannel('456')
  })

  it('check input', async () => {
    await client1.shouldReply('sudo -u @456', '请输入要触发的指令。')
    await client1.shouldReply('sudo -Cc #456 show-context', '--channel 和 --direct 无法同时使用。')
    await client2.shouldReply('sudo show-context', '请提供新的上下文。')
    await client2.shouldReply('sudo -u @789 show-context', '权限不足。')
  })

  it('private context', async () => {
    await client1.shouldReply('sudo -u @456 show-context', '456,2,undefined')
    await client1.shouldReply('sudo -c #456 show-context', '123,1,456')
    await client1.shouldReply('sudo -u @456 -c #456 show-context', '456,2,456')
  })

  it('guild context', async () => {
    await client2.shouldReply('sudo -u @456 show-context', '456,2,456')
    await client2.shouldReply('sudo -Cu @456 show-context', '456,2,undefined')
  })
})
