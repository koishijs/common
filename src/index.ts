import { Context, CommandConfig } from 'koishi-core'
import repeater, { RepeaterOptions } from './repeater'
import replies, { ReplyMatcher } from './replies'
import admin from './admin'
import echo from './echo'
import help from './help'
import rank from './rank'

export * from './admin'
export * from './rank'

export { admin, echo, help, rank, repeater, replies }

declare module 'koishi-core/dist/app' {
  interface AppOptions {
    pluginConfig?: {
      admin?: false | CommandConfig
      echo?: false | CommandConfig
      help?: false | CommandConfig
      rank?: false | CommandConfig
      repeater?: false | RepeaterOptions
      replies?: false | ReplyMatcher[]
    }
  }
}

export const name = 'common'

export function apply (ctx: Context) {
  const { pluginConfig } = ctx.app.options

  ctx
    .plugin(admin, pluginConfig.admin)
    .plugin(echo, pluginConfig.echo)
    .plugin(help, pluginConfig.help)
    .plugin(rank, pluginConfig.rank)
    .plugin(repeater, pluginConfig.repeater)
    .plugin(replies, pluginConfig.replies)
}
