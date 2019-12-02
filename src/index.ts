import { Context, CommandConfig } from 'koishi-core'
import admin from './admin'
import broadcast, { BroadcastOptions } from './broadcast'
import callme, { CallmeOptions } from './callme'
import echo from './echo'
import help from './help'
import rank from './rank'
import repeater, { RepeaterOptions } from './repeater'
import requestHandler, { HandlerOptions } from './requestHandler'
import respondent, { Respondent } from './respondent'
import welcome, { WelcomeMessage } from './welcome'

export * from './admin'
export * from './rank'

export { admin, broadcast, callme, echo, help, rank, repeater, requestHandler, respondent, welcome }

declare module 'koishi-core/dist/app' {
  interface AppOptions {
    pluginConfig?: {
      admin?: false | CommandConfig
      broadcast?: false | BroadcastOptions
      callme?: false | CallmeOptions
      echo?: false | CommandConfig
      help?: false | CommandConfig
      rank?: false | CommandConfig
      repeater?: false | RepeaterOptions
      requestHandler?: false | HandlerOptions
      respondent?: false | Respondent[]
      welcome?: false | WelcomeMessage
    }
  }
}

export const name = 'common'

export function apply (ctx: Context) {
  const { pluginConfig = {} } = ctx.app.options

  ctx
    .plugin(admin, pluginConfig.admin)
    .plugin(echo, pluginConfig.echo)
    .plugin(help, pluginConfig.help)
    .plugin(rank, pluginConfig.rank)
    .plugin(repeater, pluginConfig.repeater)
    .plugin(requestHandler, pluginConfig.requestHandler)
    .plugin(respondent, pluginConfig.respondent)
    .plugin(welcome, pluginConfig.welcome)
}
