import { ChatOptions } from "@/types/chat";

export async function handleOpenRouterChat(
  content: string,
  options: ChatOptions,
  apiKey: string,
  baseUrl: string
): Promise<string> {
  console.log('Making OpenRouter request to:', baseUrl);
  
  // If baseUrl is empty, fall back to direct provider URL
  const url = baseUrl || 'https://openrouter.ai/api/v1';
  
  const response = await fetch(`${url}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': window.location.origin,
      'X-Title': 'Chat Hub',
      // For Cloudflare, include api_key in headers
      ...(baseUrl ? { 'api_key': apiKey } : {
        // For direct API, include OpenRouter specific headers
        'OR-SDK-Version': 'chatverse-1.0',
        'OR-PREFER-BACKEND': 'openai'
      })
    },
    body: JSON.stringify({
      model: options.model,
      messages: [{ role: 'user', content }],
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 2048
    })
  });

  if (!response.ok) {
    console.error('OpenRouter API error:', response.status, response.statusText);
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(`OpenRouter API error: ${error.error || response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export async function streamOpenRouterChat(
  content: string,
  options: ChatOptions,
  apiKey: string,
  baseUrl: string,
  onChunk?: (chunk: string) => void
): Promise<string> {
  console.log("Starting OpenRouter stream request to:", baseUrl);
  
  // If baseUrl is empty, fall back to direct provider URL
  const url = baseUrl || 'https://openrouter.ai/api/v1';
  
  const response = await fetch(`${url}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
      'HTTP-Referer': window.location.origin,
      'X-Title': 'Chat Hub',
      // For Cloudflare, include api_key in headers
      ...(baseUrl ? { 'api_key': apiKey } : {
        // For direct API, include OpenRouter specific headers
        'OR-SDK-Version': 'chatverse-1.0',
        'OR-PREFER-BACKEND': 'openai'
      })
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

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim() !== '');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices[0]?.delta?.content || '';
            if (content) {
              onChunk?.(content);
              fullContent += content;
            }
          } catch (e) {
            console.log("Error parsing chunk:", e);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  return fullContent;
}