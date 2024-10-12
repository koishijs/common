import { expect, use } from 'chai'
import { App, sleep, Universal } from 'koishi'
import shape from 'chai-shape'
import mock, { DEFAULT_SELF_ID } from '@koishijs/plugin-mock'
import { mock as jest } from 'node:test'
import * as verifier from '../src'

use(shape)

async function setup(options: verifier.Config) {
  const app = new App()
  app.plugin(mock)
  app.plugin(verifier, options)
  app.start()
  const handleFriendRequest = app.bots[0].handleFriendRequest = jest.fn(async () => {})
  const handleGuildRequest = app.bots[0].handleGuildRequest = jest.fn(async () => {})
  const handleGuildMemberRequest = app.bots[0].handleGuildMemberRequest = jest.fn(async () => {})
  return { app, handleFriendRequest, handleGuildRequest, handleGuildMemberRequest }
}

function receive(app: App, event: Partial<Universal.Event>) {
  app.mock.receive(event)
  return sleep(0)
}

const receiveFriendRequest = (app: App, userId: string) => receive(app, {
  platform: 'mock',
  selfId: DEFAULT_SELF_ID,
  type: 'friend-request',
  message: { id: 'flag' },
  user: { id: userId },
})

const receiveGroupRequest = (app: App, userId: string) => receive(app, {
  platform: 'mock',
  selfId: DEFAULT_SELF_ID,
  type: 'guild-request',
  guild: { id: '10000' },
  message: { id: 'flag' },
  user: { id: userId },
})

const receiveGroupMemberRequest = (app: App, userId: string) => receive(app, {
  platform: 'mock',
  selfId: DEFAULT_SELF_ID,
  type: 'guild-member-request',
  guild: { id: '10000' },
  message: { id: 'flag' },
  user: { id: userId },
})

describe('koishi-plugin-verifier', () => {
  it('request handler: undefined', async () => {
    const instance = await setup({})

    await receiveFriendRequest(instance.app, '321')
    expect(instance.handleFriendRequest.mock.calls).to.have.length(0)

    await receiveGroupRequest(instance.app, '321')
    expect(instance.handleGuildRequest.mock.calls).to.have.length(0)

    await receiveGroupMemberRequest(instance.app, '321')
    expect(instance.handleGuildMemberRequest.mock.calls).to.have.length(0)
  })

  it('request handler: string', async () => {
    const instance = await setup({
      onFriendRequest: 'foo',
      onGuildRequest: 'baz',
      onGuildMemberRequest: 'bar',
    })

    await receiveFriendRequest(instance.app, '321')
    expect(instance.handleFriendRequest.mock.calls).to.have.length(1)
    expect(instance.handleFriendRequest.mock.calls[0].arguments).to.have.shape(['flag', true, 'foo'])

    await receiveGroupRequest(instance.app, '321')
    expect(instance.handleGuildRequest.mock.calls).to.have.length(1)
    expect(instance.handleGuildRequest.mock.calls[0].arguments).to.have.shape(['flag', false, 'baz'])

    await receiveGroupMemberRequest(instance.app, '321')
    expect(instance.handleGuildMemberRequest.mock.calls).to.have.length(1)
    expect(instance.handleGuildMemberRequest.mock.calls[0].arguments).to.have.shape(['flag', false, 'bar'])
  })

  it('request handler: boolean', async () => {
    const instance = await setup({
      onFriendRequest: false,
      onGuildRequest: false,
      onGuildMemberRequest: false,
    })

    await receiveFriendRequest(instance.app, '321')
    expect(instance.handleFriendRequest.mock.calls).to.have.length(1)
    expect(instance.handleFriendRequest.mock.calls[0].arguments).to.have.shape(['flag', false])

    await receiveGroupRequest(instance.app, '321')
    expect(instance.handleGuildRequest.mock.calls).to.have.length(1)
    expect(instance.handleGuildRequest.mock.calls[0].arguments).to.have.shape(['flag', false])

    await receiveGroupMemberRequest(instance.app, '321')
    expect(instance.handleGuildMemberRequest.mock.calls).to.have.length(1)
    expect(instance.handleGuildMemberRequest.mock.calls[0].arguments).to.have.shape(['flag', false])
  })

  it('request handler: function', async () => {
    const instance = await setup({
      onFriendRequest: () => true,
      onGuildRequest: () => true,
      onGuildMemberRequest: () => true,
    })

    await receiveFriendRequest(instance.app, '321')
    expect(instance.handleFriendRequest.mock.calls).to.have.length(1)
    expect(instance.handleFriendRequest.mock.calls[0].arguments).to.have.shape(['flag', true])

    await receiveGroupRequest(instance.app, '321')
    expect(instance.handleGuildRequest.mock.calls).to.have.length(1)
    expect(instance.handleGuildRequest.mock.calls[0].arguments).to.have.shape(['flag', true])

    await receiveGroupMemberRequest(instance.app, '321')
    expect(instance.handleGuildMemberRequest.mock.calls).to.have.length(1)
    expect(instance.handleGuildMemberRequest.mock.calls[0].arguments).to.have.shape(['flag', true])
  })
})
