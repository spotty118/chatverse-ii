import { ChatOptions } from "@/types/chat";

export const handleOpenRouterChat = async (
  content: string,
  options: ChatOptions,
  apiKey: string,
  baseUrl: string = 'https://openrouter.ai/api/v1'
): Promise<string> => {
  console.log('Sending message to OpenRouter:', { content, model: options.model });
  
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
    }),
    credentials: 'include',
    mode: 'cors'
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    console.error('OpenRouter API error:', error);
    throw new Error(`OpenRouter API error: ${error.error || response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
};