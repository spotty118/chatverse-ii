export async function handleGoogleChat(content: string, options: any, apiKey: string, baseUrl: string): Promise<string> {
  const response = await fetch(`${baseUrl}/models/${options.model}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: content }] }],
      generationConfig: {
        temperature: options.temperature,
        maxOutputTokens: options.maxTokens
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