import { Command, Context, Dict, Schema, segment, Session, Time } from 'koishi'

declare module 'koishi' {
  interface Channel {
    forward: string[]
  }
}

export interface Rule {
  source: string
  target: string
  selfId: string
  guildId?: string
}

export const Rule: Schema<Rule> = Schema.object({
  source: Schema.string().required().description('来源频道。'),
  target: Schema.string().required().description('目标频道。'),
  selfId: Schema.string().required().description('负责推送的机器人账号。'),
  guildId: Schema.string().required().description('目标频道的群组编号。'),
}).description('转发规则。')

export const name = 'forward'

export interface Config {
  mode?: 'database' | 'config'
  rules?: Rule[]
  replyTimeout?: number
}

export const Config: Schema<Config> = Schema.intersect([
  Schema.object({
    mode: Schema.union([
      Schema.const('database' as const).description('数据库'),
      Schema.const('config' as const).description('配置文件'),
    ]).default('config').description('转发规则的存储方式。'),
  }),
  Schema.union([
    Schema.object({
      mode: Schema.const('config' as const),
      rules: Schema.array(Rule).description('转发规则列表。').hidden(),
    }),
    Schema.object({}),
  ] as const),
  Schema.object({
    replyTimeout: Schema.natural().role('ms').default(Time.hour).description('转发消息不再响应回复的时间。'),
  }),
] as const)

export function apply(ctx: Context, config: Config) {
  ctx.i18n.define('zh-CN', require('./locales/zh-CN'))

  const relayMap: Dict<Rule> = {}

  async function sendRelay(session: Session<never, 'forward'>, rule: Partial<Rule>) {
    const { author, stripped } = session
    let { content } = stripped
    if (!content) return

    try {
      // get selfId
      const platform = rule.target.split(':', 1)[0]
      const channelId = rule.target.slice(platform.length + 1)
      if (!rule.selfId) {
        const channel = await ctx.database.getChannel(platform, channelId, ['assignee', 'guildId'])
        if (!channel || !channel.assignee) return
        rule.selfId = channel.assignee
        rule.guildId = channel.guildId
      }

      const bot = ctx.bots[`${platform}:${rule.selfId}`]

      // replace all mentions (koishijs/koishi#506)
      if (segment.select(stripped.content, 'at').length) {
        const dict = await session.bot.getGuildMemberMap(session.guildId)
        content = segment.transform(content, {
          at(attrs) {
            if (!attrs.id) return true
            return '@' + dict[attrs.id]
          },
        })
      }

      content = `${author.name}: ${content}`
      await bot.sendMessage(channelId, content, rule.guildId).then((ids) => {
        for (const id of ids) {
          relayMap[id] = {
            source: rule.target,
            target: session.cid,
            selfId: session.selfId,
            guildId: session.guildId,
          }
          ctx.setTimeout(() => delete relayMap[id], config.replyTimeout)
        }
      })
    } catch (error) {
      ctx.logger('forward').warn(error)
    }
  }

  ctx.middleware(async (session: Session<never, 'forward'>, next) => {
    const { quote = {}, isDirect } = session
    if (isDirect) return
    const data = relayMap[quote.id]
    if (data) return sendRelay(session, data)

    const tasks: Promise<void>[] = []
    if (config.mode === 'config') {
      for (const rule of config.rules) {
        if (session.cid !== rule.source) continue
        tasks.push(sendRelay(session, rule))
      }
    } else if (ctx.database) {
      for (const target of getTargets(session)) {
        tasks.push(sendRelay(session, { target }))
      }
    }
    const [result] = await Promise.all([next(), ...tasks])
    return result
  })

  ctx.model.extend('channel', {
    forward: 'list',
  })

  ctx.before('attach-channel', (session, fields) => {
    fields.add('forward')
  })

  if (config.mode === 'database') {
    ctx.using(['database'], commands)
  // TODO support config mode
  // } else if (ctx.loader?.writable) {
  //   ctx.plugin(commands)
  }

  function getTargets(session: Session<never, 'forward'>) {
    if (config.mode === 'database') {
      return session.channel.forward
    }

    return config.rules
      .filter(rule => rule.source === session.cid)
      .map(rule => rule.target)
  }

  function commands(ctx: Context) {
    const cmd = ctx
      .command('forward', { authority: 3 })
      .alias('fwd')

    const register = (def: string, callback: Command.Action<never, 'forward', [string]>) => cmd
      .subcommand(def, { authority: 3, checkArgCount: true })
      .channelFields(['forward'])
      .action(callback)

    register('.add <channel:channel>', async ({ session }, id) => {
      const targets = getTargets(session)
      if (targets.includes(id)) {
        return session.text('.unchanged', [id])
      } else {
        targets.push(id)
        return session.text('.updated', [id])
      }
    })

    register('.remove <channel:channel>', async ({ session }, id) => {
      const targets = getTargets(session)
      const index = targets.indexOf(id)
      if (index >= 0) {
        targets.splice(index, 1)
        return session.text('.updated', [id])
      } else {
        return session.text('.unchanged', [id])
      }
    }).alias('forward.rm')

    register('.clear', async ({ session }) => {
      session.channel.forward = []
      return session.text('.updated')
    })

    register('.list', async ({ session }) => {
      const targets = getTargets(session)
      if (!targets.length) return session.text('.empty')
      return [session.text('.header'), ...targets].join('\n')
    }).alias('forward.ls')
  }
}
