import { ChatOptions } from "@/types/chat";

export async function handleGoogleChat(
  content: string,
  options: ChatOptions,
  apiKey: string,
  baseUrl: string
): Promise<string> {
  const url = `${baseUrl}/models/${options.model}:generateContent?key=${apiKey}`;
  
  console.log("Making Google AI request to:", url);
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: content }]
      }],
      generationConfig: {
        temperature: options.temperature || 0.7,
        maxOutputTokens: options.maxTokens || 2048,
        topK: 40,
        topP: 0.95
      }
    })
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("Google AI Error:", error);
    throw new Error(error.error?.message || "Failed to get response from Google AI");
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

export async function streamGoogleChat(
  content: string,
  options: ChatOptions,
  apiKey: string,
  baseUrl: string,
  onChunk?: (chunk: string) => void
): Promise<string> {
  console.log("Starting Google AI stream request");
  
  const url = `${baseUrl}/models/${options.model}:streamGenerateContent?key=${apiKey}`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: content }]
      }],
      generationConfig: {
        temperature: options.temperature || 0.7,
        maxOutputTokens: options.maxTokens || 2048,
        topK: 40,
        topP: 0.95
      }
    })
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("Google AI Stream Error:", error);
    throw new Error("Failed to get streaming response from Google AI");
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
        console.warn("Error parsing chunk:", e);
      }
    }
    
    console.log("Google AI stream completed");
    return fullContent;
  } finally {
    reader.releaseLock();
  }
}