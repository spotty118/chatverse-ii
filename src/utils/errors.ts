export class ChatError extends Error {
  code?: string
  name: string
  
  constructor(message: string, code?: string) {
    super(message)
    this.name = 'ChatError'
    this.code = code
  }
}