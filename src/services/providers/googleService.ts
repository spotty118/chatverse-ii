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
    let accumulatedJson = "";
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      accumulatedJson += chunk;
      
      // Try to find complete JSON objects
      let startBracket = accumulatedJson.indexOf('[');
      let endBracket = accumulatedJson.lastIndexOf(']');
      
      if (startBracket !== -1 && endBracket !== -1 && startBracket < endBracket) {
        try {
          const jsonStr = accumulatedJson.substring(startBracket, endBracket + 1);
          const jsonArray = JSON.parse(jsonStr);
          
          // Process each object in the array
          for (const obj of jsonArray) {
            const text = obj.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              console.log("Received text chunk:", text);
              onChunk?.(text);
              fullContent += text;
            }
          }
          
          // Keep any remaining content after the JSON array
          accumulatedJson = accumulatedJson.substring(endBracket + 1);
        } catch (e) {
          // If parsing fails, keep accumulating
          console.log("Continuing to accumulate JSON chunks");
        }
      }
    }
    
    console.log("Google AI stream completed");
    return fullContent;
  } finally {
    reader.releaseLock();
  }
}
