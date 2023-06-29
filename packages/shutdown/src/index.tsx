import { Context, Schema } from 'koishi'

declare module 'koishi' {
  interface EnvData {
    shutdown: ShutdownInfo
  }
}

interface ShutdownInfo {
  subtype: string
  channelId: string
  guildId: string
  sid: string
  message: string
}

export const name = 'shutdown'

export const Config: Schema<{}> = Schema.object({})

interface Pending {
  timer: NodeJS.Timeout
  code: number
  date: Date
}

export function apply(ctx: Context) {
  const pendings: Pending[] = []

  ctx.i18n.define('zh', require('./locales/zh-CN'))
  ctx.i18n.define('en', require('./locales/en-US'))

  const info = ctx.envData.shutdown
  if (info) {
    const { sid, channelId, guildId, message } = info
    ctx.envData.shutdown = null
    const dispose = ctx.on('bot-status-updated', (bot) => {
      if (bot.sid !== sid || bot.status !== 'online') return
      dispose()
      // FIXME waiting for subtype support
      bot.sendMessage(channelId, message, guildId)
    })
  }

  ctx
    .command('shutdown [time:string] [wall:text]', { authority: 4 })
    .alias('exit')
    .option('reboot', '-r', { fallback: false })
    .option('rebootHard', '-R', { fallback: false })
    .option('wall', '-w', { fallback: false })
    .option('clear', '-c', { fallback: false })
    .option('show', '-s', { fallback: false })
    .action(({ options, session }, time, wall) => {
      // Handle --show
      if (options.show) {
        if (!pendings.length) return session.text('.no-pending')
        const result = [session.text('.list-header')]
        for (const pending of pendings) {
          const action = pending.code ? 'reboot' : 'poweroff'
          result.push(session.text(`.list-item.${action}`, [pending.date.toString()]))
        }
        return result.join('\n')
      }

      // Handle --clear
      if (options.clear) {
        if (!pendings.length) return session.text('.no-pending')
        for (const pending of pendings.splice(0)) {
          clearTimeout(pending.timer)
        }
        if (wall || options.wall) {
          ctx.broadcast(wall || <i18n path="commands.shutdown.wall-messages.clear"/>)
        }
        return session.text('.clear')
      }

      let parsedTime = parseTime(time || '+1')
      if (time === '+0' || time === 'now') parsedTime = 0
      else if (!parsedTime) return session.text('.invalid-time', [time])

      const { subtype, channelId, guildId, sid } = session
      const code = options.reboot ? 51 : options.rebootHard ? 52 : 0
      const date = new Date(new Date().getTime() + parsedTime)
      const action = code ? 'reboot' : 'poweroff'
      const timer = setTimeout(() => {
        if (!ctx.loader) process.exit(code)
        const message = session.text('.restarted')
        ctx.envData.shutdown = { subtype, channelId, guildId, sid, message }
        ctx.loader.fullReload(code)
      }, parsedTime)

      pendings.push({ timer, code, date })

      if (wall || options.wall) {
        const path = `commands.shutdown.wall-messages.${action}`
        ctx.broadcast(wall || <i18n path={path}>{date.toString()}</i18n>)
      }
      return session.text('.' + action, [date.toString()])
    })
}

function parseTime(time: string) {
  if (!time) return false
  const hhmm = parseHhmm(time)
  if (hhmm) return hhmm
  return parseMinutes(time)
}

function parseHhmm(time: string) {
  const splits = time.split(':')
  if (splits.length !== 2) return false
  const nums = splits.map((x) => Number(x))
  if (!nums[0] || !nums[1]) return false
  if (nums[0] < 0 || nums[1] < 0) return false
  if (nums[0] > 23 || nums[1] > 59) return false
  const date = new Date()
  date.setHours(nums[0])
  date.setMinutes(nums[1])
  date.setSeconds(0)
  date.setMilliseconds(0)
  let dateNum = date.getTime()
  const nowNum = new Date().getTime()
  if (dateNum < nowNum) dateNum += 86400000
  return dateNum - nowNum
}

function parseMinutes(time: string) {
  if (!time.startsWith('+')) return false
  const num = Number(time)
  if (!num || num < 0) return false
  return num * 60000
}
