import { ChatOptions } from "@/types/chat";

export const handleOpenRouterChat = async (
  content: string,
  options: ChatOptions,
  apiKey: string,
  baseUrl: string = 'https://openrouter.ai/api/v1'
): Promise<string> => {
  console.log('Sending message to OpenRouter:', { content, model: options.model, baseUrl });
  
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': window.location.origin,
      'X-Title': 'Chat Hub'
    },
    body: JSON.stringify({
      model: options.model,
      messages: [{ role: 'user', content }],
      temperature: options.temperature,
      max_tokens: options.maxTokens,
    })
  });

  if (!response.ok) {
    console.error('OpenRouter API error:', response.status, response.statusText);
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(`OpenRouter API error: ${error.error || response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
};

export async function streamOpenRouterChat(
  content: string,
  options: ChatOptions,
  apiKey: string,
  baseUrl: string = 'https://openrouter.ai/api/v1',
  onChunk?: (chunk: string) => void
): Promise<string> {
  console.log("Starting OpenRouter stream request");
  
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
      'HTTP-Referer': window.location.origin,
      'X-Title': 'Chat Hub'
    },
    body: JSON.stringify({
      model: options.model,
      messages: [{ role: "user", content }],
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 2048,
      stream: true
    })
  });

  if (!response.ok) {
    console.error('OpenRouter API error:', response.status, response.statusText);
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(`OpenRouter API error: ${error.error || response.statusText}`);
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let fullContent = "";

  if (!reader) {
    throw new Error("Failed to initialize stream reader");
  }

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(line => line.trim() !== '');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices[0]?.delta?.content;
            if (content) {
              console.log("Received text chunk:", content);
              onChunk?.(content);
              fullContent += content;
            }
          } catch (e) {
            console.log("Error parsing chunk:", e);
          }
        }
      }
    }
    
    console.log("OpenRouter stream completed");
    return fullContent;
  } finally {
    reader.releaseLock();
  }
}