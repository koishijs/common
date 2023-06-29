import { App } from 'koishi'
import mock from '@koishijs/plugin-mock'
import * as respondent from '../src'

const app = new App()

before(() => app.start())
after(() => app.stop())

app.plugin(mock)
app.plugin(respondent, {
  rules: [{
    match: '挖坑一时爽',
    reply: '填坑火葬场',
  }, {
    match: /^(.+)一时爽$/.source,
    regexp: true,
    reply: '一直{1}一直爽',
  }],
})

const client = app.mock.client('123')

describe('koishi-plugin-respondent', () => {
  it('basic support', async () => {
    await client.shouldReply('挖坑一时爽', '填坑火葬场')
    await client.shouldReply('填坑一时爽', '一直填坑一直爽')
    await client.shouldNotReply('填坑一直爽')
  })
})
