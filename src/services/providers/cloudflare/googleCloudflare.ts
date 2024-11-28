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
        role: "user",
        parts: [{ text: content }]
      }],
      generationConfig: {
        temperature: options.temperature || 0.7,
        maxOutputTokens: options.maxTokens || 2048
      }
    })
  });

  if (!response.ok) {
    const error = await response.json();
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
        role: "user",
        parts: [{ text: content }]
      }],
      generationConfig: {
        temperature: options.temperature || 0.7,
        maxOutputTokens: options.maxTokens || 2048
      }
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to get streaming response from Google AI Cloudflare");
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let fullContent = "";

  if (!reader) {
    throw new Error("Failed to initialize stream reader");
  }

  try {
    let accumulatedJson = "";
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      accumulatedJson += chunk;
      
      let startBracket = accumulatedJson.indexOf('[');
      let endBracket = accumulatedJson.lastIndexOf(']');
      
      if (startBracket !== -1 && endBracket !== -1 && startBracket < endBracket) {
        try {
          const jsonStr = accumulatedJson.substring(startBracket, endBracket + 1);
          const jsonArray = JSON.parse(jsonStr);
          
          for (const obj of jsonArray) {
            const text = obj.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              console.log("Received text chunk:", text);
              onChunk?.(text);
              fullContent += text;
            }
          }
          
          accumulatedJson = accumulatedJson.substring(endBracket + 1);
        } catch (e) {
          console.log("Continuing to accumulate JSON chunks");
        }
      }
    }
    
    return fullContent;
  } finally {
    reader.releaseLock();
  }
}