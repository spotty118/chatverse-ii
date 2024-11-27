import { ChatOptions } from "@/types/chat";

export async function handleOpenAIChat(
  content: string,
  options: ChatOptions,
  apiKey: string,
  baseUrl: string
): Promise<string> {
  console.log("Starting OpenAI chat request with model:", options.model);

  // All current OpenAI models are chat models
  const endpoint = "/v1/chat/completions";
  const requestBody = {
    model: options.model,
    messages: [
      ...(options.systemPrompt ? [{ role: "system", content: options.systemPrompt }] : []),
      { role: "user", content }
    ],
    temperature: options.temperature || 0.7,
    max_tokens: options.maxTokens || 2048,
    stream: false
  };

  const response = await fetch(`${baseUrl}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("OpenAI API error:", error);
    throw new Error(error.error?.message || "Failed to get response from OpenAI");
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export async function streamOpenAIChat(
  content: string,
  options: ChatOptions,
  apiKey: string,
  baseUrl: string,
  onChunk?: (chunk: string) => void
): Promise<string> {
  console.log("Starting OpenAI streaming chat with model:", options.model);
  
  const endpoint = "/v1/chat/completions";
  const requestBody = {
    model: options.model,
    messages: [
      ...(options.systemPrompt ? [{ role: "system", content: options.systemPrompt }] : []),
      { role: "user", content }
    ],
    temperature: options.temperature || 0.7,
    max_tokens: options.maxTokens || 2048,
    stream: true
  };

  const response = await fetch(`${baseUrl}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to get streaming response from OpenAI");
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