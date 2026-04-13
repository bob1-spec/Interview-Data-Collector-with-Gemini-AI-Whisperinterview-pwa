import type { Field, ExtractionResult } from '../types';

let geminiApiKey: string | null = null;

export class OpenAIExtractor {
  /**
   * Initialize client with Gemini API key
   */
  static initialize(apiKey: string) {
    geminiApiKey = apiKey;
  }

  /**
   * Check if client is initialized
   */
  static isInitialized(): boolean {
    return !!geminiApiKey;
  }

  /**
   * Extract field values using Google Gemini 1.5 API (free & powerful)
   */
  static async extractFieldValues(
    conversationHistory: string[],
    fields: Field[]
  ): Promise<ExtractionResult[]> {
    if (!geminiApiKey) {
      throw new Error('Gemini API key not initialized. Call initialize() first.');
    }

    const fieldDescriptions = fields
      .map(
        (f) =>
          `- "${f.label}" (type: ${f.type}, required: ${f.required}${
            f.options ? `, options: ${f.options.map((o) => o.value).join(', ')}` : ''
          })`
      )
      .join('\n');

    const prompt = `You are an AI assistant helping to extract structured information from a conversation. You excel at understanding context and extracting relevant information.

Given the following conversation and field definitions, extract the most relevant values you can find.

Conversation:
${conversationHistory.join('\n')}

Fields to extract:
${fieldDescriptions}

For each field, look for related information in the conversation. Be smart about inference - if someone says "I've been in tech for 5 years", and there's a field for "Years of Experience", extract that.

Return ONLY a valid JSON object with this exact structure:
{
  "extractions": [
    {
      "fieldLabel": "Field Label",
      "value": "extracted value or null",
      "confidence": 0.95
    }
  ]
}

Rules:
- Only include fields where you found relevant information (confidence > 0.5)
- value should be null if not found
- confidence should be between 0 and 1
- For select fields, only return values that match the provided options
- For dates, return in YYYY-MM-DD format if possible
- For numbers, return as numbers not strings
- Return ONLY the JSON, no other text`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 1024,
            },
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Gemini API error: ${error.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!content) {
        throw new Error('No response from Gemini API');
      }

      // Extract JSON from response
      let jsonText = content.trim();
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.warn('No JSON found in response:', content);
        return [];
      }

      const parsed = JSON.parse(jsonMatch[0]);

      const results: ExtractionResult[] = [];
      for (const extraction of parsed.extractions || []) {
        // Find matching field - try exact match first, then partial
        let matchingField = fields.find(
          (f) => f.label.toLowerCase() === extraction.fieldLabel.toLowerCase()
        );

        if (!matchingField) {
          // Try partial match
          matchingField = fields.find(
            (f) =>
              extraction.fieldLabel.toLowerCase().includes(f.label.toLowerCase()) ||
              f.label.toLowerCase().includes(extraction.fieldLabel.toLowerCase())
          );
        }

        if (matchingField && extraction.value !== null && extraction.confidence >= 0.5) {
          results.push({
            fieldId: matchingField.id,
            value: extraction.value,
            confidence: extraction.confidence,
            source: 'api',
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Error extracting with Gemini:', error);
      throw error;
    }
  }
}
