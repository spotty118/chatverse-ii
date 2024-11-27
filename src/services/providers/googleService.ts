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
  console.log("Starting Google AI stream chat");
  
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
  let buffer = "";

  if (!reader) {
    throw new Error("Failed to initialize stream reader");
  }

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;
      
      // Try to parse complete JSON objects from the buffer
      try {
        // Find complete JSON objects in the buffer
        const lines = buffer.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            if (parsed.candidates?.[0]?.content?.parts?.[0]?.text) {
              const content = parsed.candidates[0].content.parts[0].text;
              console.log("Received content chunk:", content);
              onChunk?.(content);
              fullContent += content;
            }
          } catch (e) {
            console.log("Incomplete JSON chunk, continuing...");
            continue;
          }
        }
        
        // Clear the buffer after processing
        buffer = "";
      } catch (e) {
        console.log("Error processing chunk, continuing...");
        // Keep the buffer for the next iteration
        continue;
      }
    }
  } finally {
    reader.releaseLock();
  }

  console.log("Stream completed, full content:", fullContent);
  return fullContent;
}
