export async function handleOllamaChat(content: string, options: any, baseUrl: string): Promise<string> {
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
        temperature: options.temperature,
        num_predict: options.maxTokens
      }
    })
  });

  if (!response.ok) {
    throw new Error("Failed to get response from Ollama");
  }

  const data = await response.json();
  return data.response;
}