import { App, Logger, Time } from 'koishi'
import { install, InstalledClock } from '@sinonjs/fake-timers'
import * as schedule from '../src'
import memory from '@koishijs/plugin-database-memory'
import mock from '@koishijs/plugin-mock'
import { mock as jest } from 'node:test'
import { expect, use } from 'chai'
import shape from 'chai-shape'

use(shape)

describe('koishi-plugin-schedule', () => {
  const app = new App()
  app.plugin(mock)
  const logger = new Logger('schedule')
  const client1 = app.mock.client('123', '456')
  const client2 = app.mock.client('123')

  app.plugin(memory)
  app.command('echo [content:text]').action((_, text) => text)

  const send = app.bots[0].sendMessage = jest.fn(async () => [])

  let clock: InstalledClock

  before(async () => {
    logger.level = 3
    clock = install({ now: new Date('2000-1-1 1:00') })

    await app.start()
    await app.mock.initUser('123', 4)
    await app.mock.initChannel('456')

    app.model.extend('schedule', {
      id: 'unsigned',
      assignee: 'string',
      time: 'timestamp',
      lastCall: 'timestamp',
      interval: 'integer',
      command: 'text',
      event: 'json',
    }, {
      autoInc: true,
    })

    await app.database.create('schedule', {
      time: new Date('2000-1-1 0:59'),
      assignee: app.bots[0].sid,
      interval: Time.day,
      command: 'echo bar',
      event: client2.event,
    })

    app.plugin(schedule)
  })

  after(() => {
    logger.level = 2
    clock.uninstall()
    return app.stop()
  })

  it('register schedule', async () => {
    await client1.shouldReply('schedule -l', '当前没有等待执行的日程。')
    await client1.shouldReply('schedule 1m -- echo foo', '日程已创建，编号为 2。')
    await client1.shouldReply('schedule -l', '2. 2000-01-01 01:01:00：echo foo')

    await client1.shouldReply('schedule -lf', [
      '1. 每天 00:59：echo bar，上下文：私聊 123',
      '2. 2000-01-01 01:01:00：echo foo，上下文：频道 456',
    ].join('\n'))

    await clock.tickAsync(Time.minute) // 01:01
    await client1.shouldReply('', 'foo')
    await client1.shouldReply('schedule -l', '当前没有等待执行的日程。')
  })

  it('interval schedule', async () => {
    await client1.shouldReply('schedule 00:30 / 1h -- echo foo', '日程已创建，编号为 3。')

    await clock.tickAsync(Time.minute * 20) // 01:21
    await client1.shouldNotReply('')

    await clock.tickAsync(Time.minute * 10) // 01:31
    await client1.shouldReply('', 'foo')

    await clock.tickAsync(Time.hour / 2) // 02:01
    await client1.shouldNotReply('')

    await clock.tickAsync(Time.hour / 2) // 02:31
    await client1.shouldReply('', 'foo')

    await client1.shouldReply('schedule -l', '3. 每隔 1 小时 (剩余 59 分钟)：echo foo')
    await client1.shouldReply('schedule -d 3', '日程 3 已删除。')
    await clock.tickAsync(Time.hour) // 02:31
    await client1.shouldNotReply('')
  })

  it('database integration', async () => {
    await clock.tickAsync(Time.day) // 02:31
    expect(send.mock.calls).to.have.length(1)
    expect(send.mock.calls[0].arguments).to.shape([client2.event.channel?.id, 'bar'])
  })

  it('check arguments', async () => {
    await client1.shouldReply('schedule 1m', '请输入要执行的指令。')
    await client1.shouldReply('schedule -- echo bar', '请输入执行时间。')
    await client1.shouldReply('schedule 12345 -- echo bar', '请输入合法的日期。你要输入的是不是 12345s？')
    await client1.shouldReply('schedule foo -- echo bar', '请输入合法的日期。')
    await client1.shouldReply('schedule 1999-01-01 -- echo bar', '不能指定过去的时间为执行时间。')
    await client1.shouldReply('schedule 1999-01-01 / 1s -- echo bar', '时间间隔过短。')
    await client1.shouldReply('schedule 1999-01-01 / foo -- echo bar', '请输入合法的时间间隔。')
  })
})
