import { API_CONFIG } from '~app/config'
import { AbstractBot, SendMessageParams } from '../abstract-bot'
import { parseSSEResponse } from '~utils/sse'
import { ChatError, ErrorCode } from '~utils/errors'

interface Message {
  role: 'user' | 'assistant' | 'model'
  content: string
}

export class ClaudeApiBot extends AbstractBot {
  private conversationContext?: { messages: Message[] }

  constructor(private apiKey: string) {
    super()
  }

  async doSendMessage(params: SendMessageParams) {
    const baseUrl = API_CONFIG.baseUrl
    const endpoint = API_CONFIG.endpoints.anthropic
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'POST',
      signal: params.signal,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: params.prompt }],
        stream: true,
      }),
    })

    if (!response.ok) {
      const json = await response.json()
      throw new ChatError(json.error?.message || 'Unknown error', ErrorCode.NETWORK_ERROR)
    }

    let result = ''

    await parseSSEResponse(response, (message) => {
      console.debug('claude sse message', message)
      const data = JSON.parse(message) as { message: Message }
      if (data.message) {
        result += data.message.content
        params.onEvent({ type: 'UPDATE_ANSWER', data: { text: result.trimStart() } })
      }
    })

    params.onEvent({ type: 'DONE' })
  }

  resetConversation() {
    this.conversationContext = undefined
  }

  get name(): string {
    return 'Claude (API)'
  }
}