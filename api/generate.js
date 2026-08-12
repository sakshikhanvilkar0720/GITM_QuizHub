module.exports = async (req, res) => {
    // Allow only POST requests
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {
        const { prompt } = req.body || {};

        if (!prompt) {
            return res.status(400).json({
                error: "Prompt is required"
            });
        }

        const response = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
                },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: [
                        {
                            role: "system",
                            content:
                                "You are an expert university quiz creator. Generate ONLY valid JSON. No explanations, no markdown."
                        },
                        {
                            role: "user",
                            content: prompt
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 4000
                })
            }
        );

        if (!response.ok) {
            const errorText = await response.text();

            return res.status(response.status).json({
                error: `Groq API error: ${errorText}`
            });
        }

        const data = await response.json();

        let text = data.choices?.[0]?.message?.content?.trim();

        if (!text) {
            throw new Error("No response received from Groq");
        }

        if (text.startsWith("```json")) {
            text = text
                .replace(/^```json\s*/, "")
                .replace(/```\s*$/, "")
                .trim();
        }

        if (text.startsWith("```")) {
            text = text
                .replace(/^```\s*/, "")
                .replace(/```\s*$/, "")
                .trim();
        }

        const questions = JSON.parse(text);

        return res.status(200).json(questions);

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: error.message || "Server error"
        });
    }
};