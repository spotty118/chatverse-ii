export async function handleOpenAIChat(content: string, options: any, apiKey: string, baseUrl: string): Promise<string> {
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: options.model,
      messages: [{ role: "user", content }],
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens,
      stream: false
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to get response from OpenAI");
  }

  const data = await response.json();
  return data.choices[0].message.content;
}