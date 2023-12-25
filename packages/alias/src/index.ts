import { Context, Dict, Schema } from 'koishi'
import {} from '@koishijs/plugin-help'

export interface Config {
  aliases?: Dict<string>
}

export const Config: Schema<Config> = Schema.object({
  aliases: Schema.dict(String).hidden(),
})

export const name = 'alias'

export function apply(ctx: Context, config: Config) {
  ctx.i18n.define('zh-CN', require('./locales/zh-CN'))

  function createAlias(name: string, command: string) {
    return ctx.command(name, { hidden: true })
      .action(async ({ session, source }) => {
        await session.execute(command + source.slice(name.length))
      })
  }

  for (const name in config.aliases) {
    createAlias(name, config.aliases[name])
  }

  ctx.command('alias <name:string> <command:text>', { authority: 3, checkArgCount: true })
    .action(async ({ session }, name, command) => {
      const old = ctx.$commander.get(name)
      old?.dispose()
      config.aliases[name] = command
      createAlias(name, command)
      ctx.scope.update(config, false)
      return session.text(old ? '.updated' : '.created', [name])
    })

  ctx.command('unalias <name:string>', { authority: 3, checkArgCount: true })
    .action(async ({ session }, name) => {
      const old = ctx.$commander.get(name)
      if (!old) return session.i18n('.not-found', [name])
      old.dispose()
      delete config.aliases[name]
      ctx.scope.update(config, false)
      return session.i18n('.deleted', [name])
    })
}
