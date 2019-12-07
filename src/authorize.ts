import { GroupContext, GroupMemberInfo, Context, assertContextType, injectMethods, GroupRole } from 'koishi-core'
import { complement } from 'koishi-utils'
import {} from 'koishi-database-mysql'

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
  memberAuthority?: number
  adminAuthority?: number
  ownerAuthority?: number
}

export function authorize (ctx: GroupContext, options: AuthorizeOptions) {
  assertContextType(ctx, 'group')

  if (!('memberAuthority' in options)) options.memberAuthority = 1
  if (!('adminAuthority' in options)) options.adminAuthority = options.memberAuthority
  if (!('ownerAuthority' in options)) options.ownerAuthority = options.adminAuthority

  ctx.app.receiver.once('connected', async () => {
    await ctx.database.getGroup(ctx.id, ctx.app.options.selfId)
    const memberList = await ctx.sender.getGroupMemberList(ctx.id)
    for (const role of ['member', 'admin', 'owner'] as GroupRole[]) {
      const authority = options[role + 'Authority']
      const memberIds = memberList.filter(m => m.role === role).map(m => m.userId)
      const users = ctx.app.database.getUsersWithAuthorityBelow
        ? await ctx.app.database.getUsersWithAuthorityBelow(memberIds, authority)
        : await ctx.app.database.getUsers(memberIds, ['id', 'authority'])
      const userIds = users.map(u => u.id)
      const insertIds = complement(memberIds, userIds)
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
    }
  })

  ctx.receiver.on('group_increase', updateAuthority)

  async function updateAuthority ({ userId, role }: GroupMemberInfo) {
    const authority = options[role + 'Authority']
    const user = await ctx.database.getUser(userId, authority)
    if (user.authority < authority) {
      return ctx.database.setUser(userId, { authority })
    }
  }
}

export default function apply (ctx: Context, authorityMap: Record<number, number | AuthorizeOptions> = {}) {
  for (const id in authorityMap) {
    const config = authorityMap[id]
    if (typeof config === 'number') {
      authorityMap[id] = { memberAuthority: config }
    }
    ctx.app.group(+id).plugin(authorize, authorityMap[id])
  }
}
