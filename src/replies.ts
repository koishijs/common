import { Context } from 'koishi-core'

export interface ReplyMatcher {
  match: string | RegExp
  reply: string | ((...capture: string[]) => string)
}

export default function apply (ctx: Context, repliers: ReplyMatcher[] = []) {
  ctx.middleware(({ message, $send }, next) => {
    for (const { match, reply } of repliers) {
      const capture = typeof match === 'string' ? message === match && [message] : message.match(match)
      if (capture) {
        return $send(typeof reply === 'string' ? reply : reply(...capture))
      }
    }
    return next()
  })
}
