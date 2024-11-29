import { GoogleGenerativeAI, ChatSession } from '@google/generative-ai'
import { AbstractBot, AsyncAbstractBot, SendMessageParams } from '../abstract-bot'
import { getUserConfig } from '~services/user-config'
import { API_CONFIG } from '~app/config'
import { parseSSEResponse } from '~utils/sse'
import { ChatError, ErrorCode } from '~utils/errors'

interface ConversationContext {
  chatSession: ChatSession
}

interface Message {
  role: 'user' | 'assistant' | 'model'
  content: string
}

export class GeminiApiBot extends AbstractBot {
  private conversationContext?: ConversationContext
  sdk: GoogleGenerativeAI

  constructor(public apiKey: string) {
    super()
    this.sdk = new GoogleGenerativeAI(apiKey)
  }

  async doSendMessage(params: SendMessageParams) {
    if (!this.conversationContext) {
      const model = this.sdk.getGenerativeModel({ model: 'gemini-pro' })
      const chatSession = model.startChat()
      this.conversationContext = { chatSession }
    }

    const result = await this.conversationContext.chatSession.sendMessageStream(params.prompt)

    let text = ''
    for await (const chunk of result.stream) {
      const chunkText = chunk.text()
      console.debug('gemini stream', chunkText)
      text += chunkText
      params.onEvent({ type: 'UPDATE_ANSWER', data: { text } })
    }

    if (!text) {
      params.onEvent({ type: 'UPDATE_ANSWER', data: { text: 'Empty response' } })
    }
    params.onEvent({ type: 'DONE' })
  }

  resetConversation() {
    this.conversationContext = undefined
  }

  get name(): string {
    return 'Gemini Pro'
  }
}

export class GeminiApiBackendBot extends AbstractBot {
  constructor(private apiKey: string) {
    super()
  }

  async doSendMessage(params: SendMessageParams) {
    const baseUrl = API_CONFIG.baseUrl
    const endpoint = API_CONFIG.endpoints.gemini
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
      console.debug('gemini sse message', message)
      const data = JSON.parse(message) as { message: Message }
      if (data.message) {
        result += data.message.content
        params.onEvent({ type: 'UPDATE_ANSWER', data: { text: result.trimStart() } })
      }
    })

    params.onEvent({ type: 'DONE' })
  }

  resetConversation() {
    // Reset conversation state
  }

  get name(): string {
    return 'Gemini (API)'
  }
}