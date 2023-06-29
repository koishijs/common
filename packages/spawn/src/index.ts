import { exec } from 'child_process'
import { Context, h, Schema, Time } from 'koishi'
import path from 'path'

const encodings = ['utf8', 'utf16le', 'latin1', 'ucs2'] as const

export interface Config {
  root?: string
  shell?: string
  encoding?: typeof encodings[number]
  timeout?: number
}

export const Config: Schema<Config> = Schema.object({
  root: Schema.string().description('工作路径。').default(''),
  shell: Schema.string().description('运行命令的程序。'),
  encoding: Schema.union(encodings).description('输出内容编码。').default('utf8'),
  timeout: Schema.number().description('最长运行时间。').default(Time.minute),
})

export interface State {
  command: string
  timeout: number
  output: string
  code?: number
  signal?: NodeJS.Signals
  timeUsed?: number
}

export const name = 'spawn'

export function apply(ctx: Context, config: Config) {
  ctx.i18n.define('zh', require('./locales/zh-CN'))

  ctx.command('exec <command:text>')
    .action(async ({ session }, command) => {
      if (!command) return session.text('.expect-text')

      command = h('', h.parse(command)).toString(true)
      const { timeout } = config
      const state: State = { command, timeout, output: '' }
      await session.send(session.text('.started', state))

      return new Promise((resolve) => {
        const start = Date.now()
        const child = exec(command, {
          timeout,
          cwd: path.resolve(ctx.baseDir, config.root),
          encoding: config.encoding,
          shell: config.shell,
          windowsHide: true,
        })
        child.stdout.on('data', (data) => {
          state.output += data.toString()
        })
        child.stderr.on('data', (data) => {
          state.output += data.toString()
        })
        child.on('close', (code, signal) => {
          state.code = code
          state.signal = signal
          state.timeUsed = Date.now() - start
          state.output = state.output.trim()
          resolve(session.text('.finished', state))
        })
      })
    })
}
