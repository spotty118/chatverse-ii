import { ChatOptions } from "@/types/chat";

export async function handleAnthropicCloudflareChat(
  content: string,
  options: ChatOptions,
  apiKey: string,
  baseUrl: string
): Promise<string> {
  const response = await fetch(`${baseUrl}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: options.model,
      messages: [{ role: "user", content }],
      max_tokens: options.maxTokens || 2048,
      temperature: options.temperature || 0.7
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to get response from Anthropic Cloudflare");
  }

  const data = await response.json();
  return data.content[0].text;
}

export async function streamAnthropicCloudflareChat(
  content: string,
  options: ChatOptions,
  apiKey: string,
  baseUrl: string,
  onChunk?: (chunk: string) => void
): Promise<string> {
  const response = await fetch(`${baseUrl}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: options.model,
      messages: [{ role: "user", content }],
      max_tokens: options.maxTokens || 2048,
      temperature: options.temperature || 0.7,
      stream: true
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to get streaming response from Anthropic Cloudflare");
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

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim() !== '');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.delta?.text || '';
            if (content) {
              onChunk?.(content);
              fullContent += content;
            }
          } catch (e) {
            console.error('Error parsing streaming response:', e);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  return fullContent;
}