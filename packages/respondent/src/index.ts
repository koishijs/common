import { Context, Schema } from 'koishi'

export const name = 'respondent'

export interface Rule {
  match: string
  reply: string
  regexp: boolean
  appel: boolean
  fuzzy: boolean
}

export const Rule: Schema<Rule> = Schema.object({
  match: Schema.string().description('要匹配的输入。').required(),
  reply: Schema.string().description('要回复的内容。').required(),
  regexp: Schema.boolean().description('是否使用正则表达式匹配。'),
  appel: Schema.boolean().description('是否允许前置称呼。'),
  fuzzy: Schema.boolean().description('是否允许后续内容。'),
})

export interface Config {
  rules: Rule[]
}

export const Config: Schema<Config> = Schema.object({
  rules: Schema.array(Rule),
})

export function apply(ctx: Context, config: Config) {
  for (const rule of config.rules) {
    const pattern = rule.regexp ? new RegExp(rule.match) : rule.match
    ctx.match(pattern, rule.reply, rule)
  }
}
