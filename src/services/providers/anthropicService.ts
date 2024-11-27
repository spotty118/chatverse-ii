export async function handleAnthropicChat(content: string, options: any, apiKey: string, baseUrl: string): Promise<string> {
  const response = await fetch(`${baseUrl}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: options.model,
      messages: [{ role: "user", content }],
      max_tokens: options.maxTokens || 1024,
      temperature: options.temperature
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to get response from Anthropic");
  }

  const data = await response.json();
  return data.content[0].text;
}