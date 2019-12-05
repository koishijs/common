import { GroupContext, GroupMemberInfo, Context, assertContextType, injectMethods } from 'koishi-core'
import 'koishi-database-mysql'

// optimize for mysql
declare module 'koishi-core/dist/database' {
  interface Database {
    getUsersWithAuthorityBelow <K extends UserField> (ids: number[], authority: number): Promise<Pick<UserData, 'id' | 'authority'>[]>
  }
}

injectMethods('mysql', {
  async getUsersWithAuthorityBelow (ids, authority) {
    if (!ids.length) return []
    return this.query(`SELECT 'id', 'authority' FROM users WHERE 'id' IN (${ids.join(', ')}) AND 'authority' < ?`, [authority])
  },
})

interface AuthorizeOptions {
  authority: number
}

export function authorize (ctx: GroupContext, { authority }: AuthorizeOptions) {
  assertContextType(ctx, 'group')

  ctx.app.receiver.once('connected', async () => {
    await ctx.database.getGroup(ctx.id, ctx.app.options.selfId)
    const memberIds = (await ctx.sender.getGroupMemberList(ctx.id)).map(m => m.userId)
    const users = ctx.app.database.getUsersWithAuthorityBelow
      ? await ctx.app.database.getUsersWithAuthorityBelow(memberIds, authority)
      : await ctx.app.database.getUsers(memberIds, ['id', 'authority'])
    const userIds = users.map(u => u.id)
    const insertIds = memberIds.filter((id) => !userIds.includes(id))
    const updateIds = memberIds.filter((id) => {
      const user = users.find(u => u.id === id)
      return user && user.authority < authority
    })

    for (const id of insertIds) {
      await ctx.database.getUser(id, authority)
    }

    for (const id of updateIds) {
      await ctx.database.setUser(id, { authority })
    }
  })

  ctx.receiver.on('group_increase', updateAuthority)

  async function updateAuthority ({ userId }: GroupMemberInfo) {
    const user = await ctx.database.getUser(userId, authority)
    if (user.authority < authority) {
      return ctx.database.setUser(userId, { authority })
    }
  }
}

export default function apply (ctx: Context, authorityMap: Record<number, number> = {}) {
  for (const id in authorityMap) {
    ctx.app.group(+id).plugin(authorize, { authority: authorityMap[id] })
  }
}
