import { Command, Context, Dict, Schema } from 'koishi'
import {} from '@koishijs/plugin-help'

export interface Config {}

export const Config: Schema<Config> = Schema.object({})

export const name = 'alias'

export function apply(ctx: Context, config: Config) {
  ctx.i18n.define('zh-CN', require('./locales/zh-CN'))

  const aliases: Dict<Command> = {}

  ctx.command('alias <name:string> <command:text>', { authority: 3, checkArgCount: true })
    .action(async ({ session }, name, command) => {
      const old = aliases[name]
      if (old) old.dispose()
      aliases[name] = ctx.command(name, { hidden: true })
        .action(async (argv) => {
          await session.execute(command + argv.source.slice(name.length))
        })
      return session.text(old ? '.updated' : '.created', [name])
    })

  ctx.command('unalias <name:string>', { authority: 3, checkArgCount: true })
    .action(async ({ session }, name) => {
      if (!aliases[name]) return session.i18n('.not-found', [name])
      aliases[name].dispose()
      delete aliases[name]
      return session.i18n('.deleted', [name])
    })
}
