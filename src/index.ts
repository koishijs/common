import { Context } from 'koishi-core'
import admin from './admin'
import echo from './echo'
import help from './help'
import rank from './rank'

export * from './admin'
export * from './rank'

export { admin, echo, help, rank }

export function apply (ctx: Context) {
  ctx
    .plugin(admin)
    .plugin(echo)
    .plugin(help)
    .plugin(rank)
}
