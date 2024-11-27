import { ChatOptions } from "@/types/chat";

export async function handleGoogleChat(
  content: string,
  options: ChatOptions,
  apiKey: string,
  baseUrl: string
): Promise<string> {
  const response = await fetch(`${baseUrl}/models/${options.model}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: content }] }],
      generationConfig: {
        temperature: options.temperature || 0.7,
        maxOutputTokens: options.maxTokens || 2048
      }
    })
  });

  if (!response.ok) {
    const error = await response.json();
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
  
  const response = await fetch(`${baseUrl}/models/${options.model}:streamGenerateContent?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: content }] }],
      generationConfig: {
        temperature: options.temperature || 0.7,
        maxOutputTokens: options.maxTokens || 2048
      }
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to get streaming response from Google AI");
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let fullContent = "";

  if (!reader) {
    throw new Error("Failed to initialize stream reader");
  }

  try {
    let buffer = "";
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      
      // Process complete chunks
      const chunks = buffer.split('\n');
      buffer = chunks.pop() || ""; // Keep the last incomplete chunk in buffer
      
      for (const chunk of chunks) {
        if (chunk.trim()) {
          try {
            const data = JSON.parse(chunk);
            if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
              const content = data.candidates[0].content.parts[0].text;
              onChunk?.(content);
              fullContent += content;
            }
          } catch (e) {
            console.log("Skipping invalid JSON chunk:", chunk);
          }
        }
      }
    }
    
    // Process any remaining data
    if (buffer) {
      try {
        const data = JSON.parse(buffer);
        if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
          const content = data.candidates[0].content.parts[0].text;
          onChunk?.(content);
          fullContent += content;
        }
      } catch (e) {
        console.log("Skipping invalid final JSON chunk");
      }
    }
  } finally {
    reader.releaseLock();
  }

  console.log("Google AI stream completed");
  return fullContent;
}