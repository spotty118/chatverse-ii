import { ChatOptions } from "@/types/chat";

export async function handleOllamaCloudflareChat(
  content: string,
  options: ChatOptions,
  baseUrl: string
): Promise<string> {
  const response = await fetch(`${baseUrl}/api/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: options.model,
      prompt: content,
      stream: false,
      options: {
        temperature: options.temperature || 0.7,
        num_predict: options.maxTokens || 2048
      }
    })
  });

  if (!response.ok) {
    throw new Error("Failed to get response from Ollama Cloudflare");
  }

  const data = await response.json();
  return data.response;
}