import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text1, text2, mode } = req.body;

  if (!text1) {
    return res.status(400).json({ error: "At least one text is required" });
  }

  try {
    let prompt = "";

    if (mode === "single") {
      prompt = `You are an expert plagiarism detection AI. Analyze the following text and assess the likelihood it contains plagiarized content. Look for:
- Overly formal or inconsistent writing styles
- Unusual phrase patterns
- Content that sounds copy-pasted
- Academic or internet-style phrasing

TEXT TO ANALYZE:
"""
${text1}
"""

Respond ONLY in this exact JSON format (no markdown, no extra text):
{
  "plagiarismScore": <number 0-100>,
  "originalityScore": <number 0-100>,
  "verdict": "<LIKELY ORIGINAL | POSSIBLY PLAGIARIZED | LIKELY PLAGIARIZED>",
  "confidence": "<LOW | MEDIUM | HIGH>",
  "suspiciousSegments": [
    { "text": "<exact suspicious phrase>", "reason": "<why suspicious>" }
  ],
  "writingStyleAnalysis": "<brief analysis of writing style consistency>",
  "summary": "<2-3 sentence overall assessment>"
}`;
    } else {
      prompt = `You are an expert plagiarism detection AI. Compare these two texts and determine if Text B was plagiarized from Text A (or vice versa), or if they share significant similarities.

TEXT A (Source/Reference):
"""
${text1}
"""

TEXT B (Submission/Comparison):
"""
${text2}
"""

Respond ONLY in this exact JSON format (no markdown, no extra text):
{
  "similarityScore": <number 0-100>,
  "plagiarismScore": <number 0-100>,
  "verdict": "<NO PLAGIARISM | POSSIBLE PLAGIARISM | CONFIRMED PLAGIARISM>",
  "confidence": "<LOW | MEDIUM | HIGH>",
  "matchedSegments": [
    { "textA": "<phrase from text A>", "textB": "<matching/similar phrase from text B>", "similarity": "<EXACT | PARAPHRASED | SIMILAR_IDEA>" }
  ],
  "paraphrasingDetected": <true|false>,
  "structuralSimilarity": "<LOW | MEDIUM | HIGH>",
  "summary": "<2-3 sentence overall assessment>"
}`;
    }

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    });

    const responseText = message.content[0].text;

    // Clean up response - strip markdown if present
    const cleaned = responseText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const result = JSON.parse(cleaned);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Analysis failed. Please try again." });
  }
}
