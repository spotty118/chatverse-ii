import { ChatOptions } from "@/types/chat";

export async function handleGoogleCloudflareChat(
  content: string,
  options: ChatOptions,
  apiKey: string,
  baseUrl: string
): Promise<string> {
  const response = await fetch(`${baseUrl}/models/${options.model}:generateContent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: content }]
      }],
      generationConfig: {
        temperature: options.temperature,
        maxOutputTokens: options.maxTokens,
      }
    })
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("Google Cloudflare API error:", error);
    throw new Error(error.error?.message || "Failed to get response from Google AI Cloudflare");
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

export async function streamGoogleCloudflareChat(
  content: string,
  options: ChatOptions,
  apiKey: string,
  baseUrl: string,
  onChunk?: (chunk: string) => void
): Promise<string> {
  const response = await fetch(`${baseUrl}/models/${options.model}:streamGenerateContent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: content }]
      }],
      generationConfig: {
        temperature: options.temperature,
        maxOutputTokens: options.maxTokens,
      }
    })
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("Google Cloudflare API streaming error:", error);
    throw new Error(error.error?.message || "Failed to get streaming response from Google AI Cloudflare");
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
      try {
        const lines = chunk.split('\n').filter(line => line.trim());
        for (const line of lines) {
          const data = JSON.parse(line);
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            console.log("Received text chunk:", text);
            onChunk?.(text);
            fullContent += text;
          }
        }
      } catch (e) {
        console.log("Error parsing chunk, continuing:", e);
      }
    }
    
    return fullContent;
  } finally {
    reader.releaseLock();
  }
}