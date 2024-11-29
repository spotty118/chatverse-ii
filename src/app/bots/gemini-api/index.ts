import { GoogleGenerativeAI, ChatSession } from '@google/generative-ai'
import { AbstractBot, SendMessageParams } from '../abstract-bot'
import { API_CONFIG } from '~app/config'
import { parseSSEResponse } from '~utils/sse'
import { ChatError, ErrorCode } from '~utils/errors'

interface ConversationContext {
  chatSession: ChatSession
}

export class GeminiApiBot extends AbstractBot {
  private conversationContext?: ConversationContext
  sdk: GoogleGenerativeAI

  constructor(public apiKey: string) {
    super()
    this.sdk = new GoogleGenerativeAI(apiKey)
  }

  resetConversation() {
    this.conversationContext = undefined
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

  get name(): string {
    return 'Gemini Pro'
  }
}