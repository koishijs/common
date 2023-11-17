import { Context, Schema } from 'koishi'

export interface Config {
  execute: string
}

export const Config: Schema<Config> = Schema.object({
  execute: Schema.string().default('help').description('要执行的指令。'),
})

export const name = 'at-command'

export function apply(ctx: Context, config: Config) {
  ctx.middleware(async (session, next) => {
    const { content, atSelf } = session.stripped
    if (content || !atSelf) return next()
    return session.execute(config.execute)
  })
}
