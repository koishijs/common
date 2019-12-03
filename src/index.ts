import { Context, CommandConfig } from 'koishi-core'
import admin from './admin'
import broadcast, { BroadcastOptions } from './broadcast'
import callme, { CallmeOptions } from './callme'
import echo from './echo'
import exit from './exit'
import help from './help'
import rank from './rank'
import repeater, { RepeaterOptions } from './repeater'
import requestHandler, { HandlerOptions } from './requestHandler'
import respondent, { Respondent } from './respondent'
import welcome, { WelcomeMessage } from './welcome'

export * from './admin'
export * from './echo'
export * from './rank'

export { admin, broadcast, callme, echo, exit, help, rank, repeater, requestHandler, respondent, welcome }

interface CommonPluginOptions {
  admin?: false | CommandConfig
  broadcast?: false | BroadcastOptions
  callme?: false | CallmeOptions
  echo?: false | CommandConfig
  exit?: false | CommandConfig
  help?: false | CommandConfig
  rank?: false | CommandConfig
  repeater?: false | RepeaterOptions
  requestHandler?: false | HandlerOptions
  respondent?: false | Respondent[]
  welcome?: false | WelcomeMessage
}

export const name = 'common'

export function apply (ctx: Context, options: CommonPluginOptions) {
  ctx
    .plugin(admin, options.admin)
    .plugin(broadcast, options.broadcast)
    .plugin(callme, options.callme)
    .plugin(echo, options.echo)
    .plugin(exit, options.exit)
    .plugin(help, options.help)
    .plugin(rank, options.rank)
    .plugin(repeater, options.repeater)
    .plugin(requestHandler, options.requestHandler)
    .plugin(respondent, options.respondent)
    .plugin(welcome, options.welcome)
}
