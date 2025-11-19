import dotenv from "dotenv";

dotenv.config();

/**
 * AI Service - Centralized AI/ML interaction layer
 */
class AIService {
  constructor() {
    this.apiKey = process.env.GROQ_API_KEY || process.env.GROK_API_KEY;
    this.endpoint = "https://api.groq.com/openai/v1/chat/completions";
    this.model = "llama-3.3-70b-versatile";
    this.requestCount = 0;
    this.cacheEnabled = true;
    this.cache = new Map();
    
    // Log AI status on startup
    if (this.apiKey && !this.apiKey.includes('your-')) {
      console.log('✅ GROQ AI enabled - Real AI verification active');
    } else {
      console.log('⚠️  No AI key - Using mock verification');
    }
  }

  /**
   * Verify a claim using AI
   */
  async verifyClaim(claim) {
    try {
      // Check cache first
      if (this.cacheEnabled && this.cache.has(claim)) {
        console.log('💾 Cache hit for claim');
        return this.cache.get(claim);
      }

      if (!this.apiKey || this.apiKey.includes('your-')) {
        return this.mockVerification(claim);
      }

      const prompt = `Analyze this claim and respond with either TRUE or FALSE followed by a brief explanation.

Claim: "${claim}"

Format your response exactly like this:
TRUE - [your explanation]
OR
FALSE - [your explanation]`;

      console.log(`🤖 Calling GROQ AI (Request #${++this.requestCount})...`);

      const response = await fetch(this.endpoint, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: "user", content: prompt }],
          max_tokens: 256,
          temperature: 0.3
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      const aiResponse = result?.choices?.[0]?.message?.content?.trim();

      if (!aiResponse) {
        throw new Error("No content in AI response");
      }

      // Parse response
      const isTrue = aiResponse.toUpperCase().includes('TRUE');
      const isFalse = aiResponse.toUpperCase().includes('FALSE');

      let verdict, confidence;

      if (isTrue && !isFalse) {
        verdict = 'TRUE';
        confidence = this.extractConfidence(aiResponse) || 85;
      } else if (isFalse && !isTrue) {
        verdict = 'FALSE';
        confidence = this.extractConfidence(aiResponse) || 85;
      } else {
        verdict = 'UNCERTAIN';
        confidence = 50;
      }

      const verificationResult = {
        verdict,
        confidence,
        reasoning: aiResponse,
        verifier: 'GROQ AI (Llama 3.3 70B)',
        rawResponse: aiResponse,
        timestamp: new Date().toISOString(),
        cached: false
      };

      // Cache result
      if (this.cacheEnabled) {
        this.cache.set(claim, { ...verificationResult, cached: true });
      }

      console.log(`✅ AI Verification: ${verdict} (${confidence}%)`);

      return verificationResult;

    } catch (error) {
      console.error('❌ AI verification failed:', error.message);
      console.log('⚠️  Falling back to mock verification');
      // Fallback to mock
      return this.mockVerification(claim);
    }
  }

  /**
   * Mock verification for demo/fallback
   */
  mockVerification(claim) {
    const lowerClaim = claim.toLowerCase();
    
    const scenarios = [
      {
        keywords: ['hedera', 'carbon negative'],
        verdict: 'TRUE',
        confidence: 92,
        reasoning: 'Hedera has achieved carbon negativity through renewable energy credits and environmental initiatives.'
      },
      {
        keywords: ['earth', 'billion years'],
        verdict: 'TRUE',
        confidence: 95,
        reasoning: 'Scientific consensus places Earth\'s age at approximately 4.54 billion years.'
      },
      {
        keywords: ['water', 'boil', '100'],
        verdict: 'TRUE',
        confidence: 98,
        reasoning: 'Water boils at 100°C (212°F) at standard atmospheric pressure.'
      },
      {
        keywords: ['ai', 'process', 'faster'],
        verdict: 'TRUE',
        confidence: 88,
        reasoning: 'AI systems can process certain types of information significantly faster than humans.'
      },
      {
        keywords: ['flat earth', 'earth is flat'],
        verdict: 'FALSE',
        confidence: 99,
        reasoning: 'Scientific evidence overwhelmingly proves Earth is spherical.'
      }
    ];

    for (const scenario of scenarios) {
      if (scenario.keywords.some(kw => lowerClaim.includes(kw))) {
        return {
          verdict: scenario.verdict,
          confidence: scenario.confidence,
          reasoning: scenario.reasoning,
          verifier: 'Mock AI (Demo Mode)',
          rawResponse: `${scenario.verdict} - ${scenario.reasoning}`,
          timestamp: new Date().toISOString(),
          cached: false
        };
      }
    }

    // Default random verdict
    const verdict = Math.random() > 0.5 ? 'TRUE' : 'FALSE';
    const confidence = Math.floor(Math.random() * 30) + 60;

    return {
      verdict,
      confidence,
      reasoning: 'Mock verification - This claim requires expert analysis.',
      verifier: 'Mock AI (Demo Mode)',
      rawResponse: `${verdict} - Demo verification`,
      timestamp: new Date().toISOString(),
      cached: false
    };
  }

  /**
   * Extract confidence percentage from response
   */
  extractConfidence(response) {
    const match = response.match(/(\d+)%/);
    return match ? parseInt(match[1]) : null;
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    console.log('🗑️  AI cache cleared');
  }

  /**
   * Get service stats
   */
  getStats() {
    return {
      requestCount: this.requestCount,
      cacheSize: this.cache.size,
      cacheEnabled: this.cacheEnabled,
      model: this.model
    };
  }
}

// Export singleton instance
export const aiService = new AIService();
