import { Context, User, userFlags, UserFlag, Meta, UserField, getTargetId, CommandConfig } from 'koishi-core'
import { camelCase, snakeCase, isInteger } from 'koishi-utils'

type ActionCallback <K extends UserField = UserField> = (this: Context, meta: Meta, user: User<K>, ...args: string[]) => Promise<void>

export interface AdminAction {
  callback: ActionCallback
  fields: UserField[]
}

const actionMap: Record<string, AdminAction> = {}

export function registerAdminAction <K extends UserField> (name: string, callback: ActionCallback<K>, fields: K[] = []) {
  actionMap[name] = { callback, fields }
}

registerAdminAction('setAuth', async (meta, user, value) => {
  const authority = Number(value)
  if (!isInteger(authority) || authority < 0) return meta.$send('参数错误。')
  if (authority >= meta.$user.authority) return meta.$send('权限不足。')
  if (authority === user.authority) {
    return meta.$send('用户权限未改动。')
  } else {
    user.authority = authority
    await user._update()
    return meta.$send('用户权限已修改。')
  }
})

registerAdminAction('setFlag', async (meta, user, ...flags) => {
  if (!flags.length) return meta.$send(`可用的标记有 ${userFlags.join(', ')}。`)
  const notFound = flags.filter(n => !userFlags.includes(n))
  if (notFound.length) return meta.$send(`未找到标记 ${notFound.join(', ')}。`)
  for (const name of flags) {
    user.flag |= UserFlag[name]
  }
  await user._update()
  return meta.$send('用户信息已修改。')
})

registerAdminAction('unsetFlag', async (meta, user, ...flags) => {
  if (!flags.length) return meta.$send(`可用的 flag 有：${userFlags.join(', ')}。`)
  const notFound = flags.filter(n => !userFlags.includes(n))
  if (notFound.length) return meta.$send(`未找到标记 ${notFound.join(', ')}。`)
  for (const name of flags) {
    user.flag &= ~UserFlag[name]
  }
  await user._update()
  return meta.$send('用户信息已修改。')
})

registerAdminAction('clearUsage', async (meta, user, ...commands) => {
  if (commands.length) {
    for (const command of commands) {
      delete user.usage[command]
    }
  } else {
    user.usage = {}
  }
  await user._update()
  return meta.$send('用户信息已修改。')
})

registerAdminAction('showUsage', async (meta, user, ...commands) => {
  const { usage } = user
  if (!commands.length) commands = Object.keys(usage)
  if (!commands.length) return meta.$send('用户今日没有调用过指令。')
  return meta.$send([
    '用户今日各指令的调用次数为：',
    ...commands.sort().map(name => `${name}：${usage[name] ? usage[name].count : 0} 次`),
  ].join('\n'))
})

export default function apply (ctx: Context, options: CommandConfig) {
  const availableCommands = Object.keys(actionMap).map(snakeCase).join(', ')

  ctx.command('advanced')
    .subcommand('admin <action> [...args]', '管理用户', { authority: 4, ...options })
    .option('-u, --user <user>', '指定目标用户')
    .action(async ({ meta, options }, name: string, args: any[]) => {
      if (!name) return meta.$send(`当前的可用指令有：${availableCommands}。`)
      const action = actionMap[camelCase(name)]
      if (!action) return meta.$send(`指令未找到。当前的可用指令有：${availableCommands}。`)
      const fields = action.fields.slice()
      if (!fields.includes('authority')) fields.push('authority')

      let user: User
      if (options.user) {
        const qq = getTargetId(options.user)
        if (!qq) return meta.$send('未指定目标。')
        user = await ctx.database.observeUser(qq, 0, fields)
        if (!user) return meta.$send('未找到用户。')
        if (qq !== meta.$user.id && meta.$user.authority <= user.authority) return meta.$send('权限不足。')
      } else {
        user = await ctx.database.observeUser(meta.$user, 0, fields)
      }

      return action.callback.call(ctx, meta, user, ...args)
    })
}
