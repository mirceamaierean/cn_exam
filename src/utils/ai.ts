export async function getExplanation(
  question: string,
  userAnswer: string,
  correctAnswer: string,
  allAnswers: string[] = []
) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    console.error("VITE_GEMINI_API_KEY is not set in .env file");
    return "API key not configured. Please add VITE_GEMINI_API_KEY to your .env file.";
  }

  const answerOptions = allAnswers
    .map((answer, index) => `${String.fromCharCode(97 + index)}) ${answer}`)
    .join("\n");

  const prompt = `Question: ${question}

Available answers:
${answerOptions}

User selected: ${userAnswer}
Correct answer: ${correctAnswer}

Please explain why the user's answer was incorrect and why the correct answer is right. Reference the specific options in your explanation.`;

  // Models to try in order (primary, then fallback)
  const models = ["gemini-3-flash-preview", "gemini-2.5-flash", "gemini-2.5-flash-lite"];

  for (const model of models) {
    try {
      console.log(`Trying model: ${model}`);
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }],
              },
            ],
          }),
        }
      );

      // If model is overloaded (503) or quota exceeded (429), try the next model
      if (response.status === 503 || response.status === 429) {
        console.warn(`Model ${model} unavailable (${response.status}), trying fallback...`);
        continue;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("API Error:", response.status, errorData);
        return `API Error: ${response.status} - ${errorData?.error?.message || "Unknown error"}`;
      }

      const data = await response.json();

      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        console.error("Unexpected API response:", data);
        return "Received unexpected response from API.";
      }

      console.log(`Success with model: ${model}`);
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error(`Error with model ${model}:`, error);
      // If this is the last model, return the error
      if (model === models[models.length - 1]) {
        return `Unable to generate explanation: ${error instanceof Error ? error.message : "Unknown error"}`;
      }
      // Otherwise, try the next model
      continue;
    }
  }

  return "All models are currently unavailable. Please try again later.";
}
