import { Context, Schema, Session } from 'koishi'

export interface Config {}

export const name = 'sudo'
export const using = ['database'] as const
export const Config: Schema<Config> = Schema.object({})

function parsePlatform(target: string) {
  const index = target.indexOf(':')
  const platform = target.slice(0, index)
  const id = target.slice(index + 1)
  return [platform, id]
}

export function apply(ctx: Context) {
  ctx.i18n.define('zh-CN', require('./locales/zh-CN'))

  ctx.command('sudo <command:text>', { authority: 3 })
    .userFields(['authority'])
    .option('user', '-u [id:user]')
    .option('channel', '-c [id:channel]')
    .option('direct', '-C, -d')
    .action(async ({ session, options }, message) => {
      if (!message) return session.text('.expect-command')

      if (options.channel && options.direct) {
        return session.text('.direct-channel')
      }

      if (!options.user && !options.channel && !options.direct) {
        return session.text('.expect-context')
      }

      // create new session
      const sess = new Session(session.bot, session)

      // patch channel
      if (options.direct) {
        sess.subtype = 'private'
        sess.isDirect = true
      } else if (options.channel && options.channel !== session.cid) {
        sess.channelId = parsePlatform(options.channel)[1]
        sess.subtype = 'group'
        await sess.observeChannel()
      } else {
        sess.channel = session.channel
      }

      // patch user
      if (options.user && options.user !== session.uid) {
        sess.userId = sess.author.userId = parsePlatform(options.user)[1]
        const user = await sess.observeUser(['authority'])
        if (session.user.authority <= user.authority) {
          return session.text('internal.low-authority')
        }
        if (!sess.isDirect) {
          const info = await session.bot.getGuildMember?.(sess.guildId, sess.userId).catch(() => ({}))
          Object.assign(sess.author, info)
        } else {
          const info = await session.bot.getUser?.(sess.userId).catch(() => ({}))
          Object.assign(sess.author, info)
        }
      } else {
        sess.user = session.user
        sess.author = session.author
      }

      await sess.execute(message)
    })
}
