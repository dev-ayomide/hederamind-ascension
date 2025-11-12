import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

/**
 * Classify a claim using the GROQ API
 * @param {string} claim - The claim to verify
 * @returns {Promise<string>} - GROQ's response (TRUE/FALSE + explanation)
 */
export async function classifyClaim(claim) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === 'your-groq-api-key') {
    throw new Error("Missing or invalid GROQ_API_KEY in .env");
  }

  console.log(`🔑 Using GROQ API Key: ${apiKey.substring(0, 10)}...`);

  // GROQ API endpoint (correct URL)
  const endpoint = "https://api.groq.com/openai/v1/chat/completions";
  const prompt = `Analyze this claim and respond with either TRUE or FALSE followed by a brief explanation.

Claim: "${claim}"

Format your response exactly like this:
TRUE - [your explanation]
OR
FALSE - [your explanation]`;

  console.log(`📡 Calling GROQ API endpoint: ${endpoint}`);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "user", content: prompt }
        ],
        max_tokens: 256,
        temperature: 0.3
      })
    });

    console.log(`📊 Response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error Response: ${errorText}`);
      throw new Error(`GROQ API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log(`📄 Raw API Response:`, JSON.stringify(result, null, 2));
    
    // Parse GROQ response structure
    const aiResponse = result?.choices?.[0]?.message?.content?.trim();
    
    if (!aiResponse) {
      throw new Error("No content in GROQ API response");
    }
    
    console.log(`✅ GROQ AI says: ${aiResponse}`);
    return aiResponse;
    
  } catch (error) {
    console.error(`💥 GROQ API call failed:`, error);
    throw error;
  }
}