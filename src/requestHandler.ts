import { App, Meta } from 'koishi-core'

type RequestHandler = boolean | ((meta: Meta, app: App) => boolean | void | Promise<boolean | void>)

export interface HandlerOptions {
  handleFriend?: RequestHandler
  handleGroupAdd?: RequestHandler
  handleGroupInvite?: RequestHandler
}

const defaultHandlers: HandlerOptions = {
  async handleFriend (meta, app) {
    const user = await app.database.getUser(meta.userId, 0, ['authority'])
    if (user.authority >= 1) return true
  },
  async handleGroupInvite (meta, app) {
    const user = await app.database.getUser(meta.userId, 0, ['authority'])
    if (user.authority >= 4) return true
  },
}

async function getHandleResult (handler: RequestHandler, meta: Meta, ctx: App) {
  return typeof handler === 'function' ? handler(meta, ctx) : handler
}

export default function apply (ctx: App, options: HandlerOptions = {}) {
  const { handleFriend, handleGroupAdd, handleGroupInvite } = { ...defaultHandlers, ...options }

  ctx.receiver.on('request/friend', async (meta) => {
    const result = await getHandleResult(handleFriend, meta, ctx)
    if (typeof result === 'boolean') {
      await ctx.sender.setFriendAddRequest(meta.flag, result)
    }
  })

  ctx.receiver.on('request/group/add', async (meta) => {
    const result = await getHandleResult(handleGroupAdd, meta, ctx)
    if (typeof result === 'boolean') {
      await ctx.sender.setGroupAddRequest(meta.flag, 'add', result)
    }
  })

  ctx.receiver.on('request/group/invite', async (meta) => {
    const result = await getHandleResult(handleGroupInvite, meta, ctx)
    if (typeof result === 'boolean') {
      await ctx.sender.setGroupAddRequest(meta.flag, 'invite', result)
    }
  })
}
