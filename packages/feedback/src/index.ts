import { Context, deepEqual, Dict, pick, Schema, sleep, Time } from 'koishi'

interface Receiver {
  platform: string
  selfId: string
  channelId: string
  guildId?: string
}

const Receiver: Schema<Receiver> = Schema.object({
  platform: Schema.string().required().description('平台名称。'),
  selfId: Schema.string().required().description('机器人 ID。'),
  channelId: Schema.string().required().description('频道 ID。'),
  guildId: Schema.string().description('群组 ID。'),
})

export interface Config {
  receivers?: Receiver[]
  replyTimeout?: number
}

export const Config: Schema<Config> = Schema.object({
  receivers: Schema.array(Receiver).role('table').hidden().description('反馈接收列表。'),
  replyTimeout: Schema.number().default(Time.day).description('反馈回复时限。'),
})

export const name = 'feedback'

export function apply(ctx: Context, config: Config) {
  ctx.i18n.define('zh-CN', require('./locales/zh-CN'))

  const logger = ctx.logger('feedback')

  type FeedbackData = [sid: string, channelId: string, guildId: string]
  const feedbacks: Dict<FeedbackData> = {}

  ctx.command('feedback <message:text>')
    .userFields(['name', 'id'])
    .option('receive', '-r', { authority: 3, value: true })
    .option('receive', '-R', { authority: 3, value: false })
    .action(async ({ session, options }, text) => {
      if (typeof options.receive === 'boolean') {
        const index = config.receivers.findIndex(receiver => {
          return deepEqual(
            pick(receiver, ['platform', 'selfId', 'channelId', 'guildId']),
            pick(session, ['platform', 'selfId', 'channelId', 'guildId']),
          )
        })
        if (options.receive) {
          if (index >= 0) return session.text('.not-modified')
          config.receivers.push(pick(session, ['platform', 'selfId', 'channelId', 'guildId']))
          logger.info(`add receiver ${session.platform}:${session.selfId}:${session.channelId}:${session.guildId}`)
        } else {
          if (index < 0) return session.text('.not-modified')
          config.receivers.splice(index, 1)
          logger.info(`remove receiver ${session.platform}:${session.selfId}:${session.channelId}:${session.guildId}`)
        }
        ctx.scope.update(config, false)
        return session.text('.updated')
      }

      if (!text) return session.text('.expect-text')
      const { username: name, userId } = session
      const nickname = name === '' + userId ? userId : `${name} (${userId})`
      const message = session.text('.receive', [nickname, text])
      const delay = ctx.root.config.delay.broadcast
      const data: FeedbackData = [session.sid, session.channelId, session.guildId]
      for (let index = 0; index < config.receivers.length; ++index) {
        if (index && delay) await sleep(delay)
        const { platform, selfId, channelId, guildId } = config.receivers[index]
        const bot = ctx.bots.find(bot => bot.platform === platform && bot.selfId === selfId)
        if (!bot) {
          logger.warn(`cannot find bot (${platform}:${selfId})`)
          continue
        }
        await bot.sendMessage(channelId, message, guildId).then((ids) => {
          for (const id of ids) {
            feedbacks[id] = data
            ctx.setTimeout(() => delete feedbacks[id], config.replyTimeout)
          }
        }, (error) => {
          logger.warn(error)
        })
      }
      return session.text('.success')
    })

  ctx.middleware(async (session, next) => {
    const { quote, stripped } = session
    if (!stripped.content || !quote) return next()
    const data = feedbacks[quote.id]
    if (!data) return next()
    await ctx.bots[data[0]].sendMessage(data[1], stripped.content, data[2])
  })
}
