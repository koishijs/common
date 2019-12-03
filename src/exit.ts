import { Context, CommandConfig } from 'koishi-core'

export const CODE_STOP = 0
export const CODE_RESTART = -1

export default function apply (ctx: Context, options: CommandConfig) {
  ctx.command('exit', '停止运行', { authority: 4, ...options })
    .option('-c, --code [code]', '设置 exit code')
    .shortcut('关机', { prefix: true, options: { code: CODE_STOP } })
    .shortcut('重启', { prefix: true, options: { code: CODE_RESTART } })
    .action(({ options }) => {
      process.exit(+options.code)
    })
}
