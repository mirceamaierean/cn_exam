export async function getExplanation(
  question: string,
  userAnswer: string,
  correctAnswer: string,
  allAnswers: string[] = []
) {
  const answerOptions = allAnswers
    .map((answer, index) => `${String.fromCharCode(97 + index)}) ${answer}`)
    .join("\n");

  const prompt = `Question: ${question}

Available answers:
${answerOptions}

User selected: ${userAnswer}
Correct answer: ${correctAnswer}

Please explain why the user's answer was incorrect and why the correct answer is right. Reference the specific options in your explanation.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${
        import.meta.env.VITE_GEMINI_API_KEY
      }`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Error getting explanation:", error);
    return "Unable to generate explanation at this time.";
  }
}
