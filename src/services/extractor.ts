import type { ExtractionResult, Field } from '../types';

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_REGEX = /(\+?1?\s*)?(\(?[\d]{3}\)?[\s.-]?)?[\d]{3}[\s.-]?[\d]{4}/g;
const DATE_REGEX = /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})/g;
const YEARS_REGEX = /(\d+)\s*(?:years?|yrs?)\s*(?:of\s+)?(?:experience|exp)?/gi;
const NAME_AFTER_IS = /(?:name\s+is|called|i'm|i am)\s+([a-zA-Z\s]+?)(?:\.|,|and|$)/gi;

export class LocalExtractor {
  /**
   * Extract email addresses from text
   */
  static extractEmails(text: string): string[] {
    const matches = text.match(EMAIL_REGEX) || [];
    return [...new Set(matches)];
  }

  /**
   * Extract phone numbers from text
   */
  static extractPhones(text: string): string[] {
    const matches = text.match(PHONE_REGEX) || [];
    return [...new Set(matches)];
  }

  /**
   * Extract dates from text
   */
  static extractDates(text: string): string[] {
    const matches = text.match(DATE_REGEX) || [];
    return [...new Set(matches)];
  }

  /**
   * Extract years of experience
   */
  static extractYearsOfExperience(text: string): number | null {
    const matches = text.match(YEARS_REGEX);
    if (matches && matches.length > 0) {
      const match = matches[0].match(/\d+/);
      return match ? parseInt(match[0], 10) : null;
    }
    return null;
  }

  /**
   * Extract name after "name is", "called", etc.
   */
  static extractName(text: string): string | null {
    const matches = text.matchAll(NAME_AFTER_IS);
    for (const match of matches) {
      const name = match[1]?.trim();
      if (name && name.length > 2) {
        return name;
      }
    }
    return null;
  }

  /**
   * Detect field label keywords to map conversation to fields
   */
  static detectFieldMatch(textLower: string, fieldLabel: string): number {
    const label = fieldLabel.toLowerCase();
    let score = 0;

    // Exact substring match
    if (textLower.includes(label)) score += 50;

    // Keyword matches
    if (label.includes('email') && textLower.match(EMAIL_REGEX)) score += 30;
    if (label.includes('phone') && textLower.match(PHONE_REGEX)) score += 30;
    if (label.includes('date') && textLower.match(DATE_REGEX)) score += 30;
    if (
      (label.includes('name') || label.includes('candidate')) &&
      this.extractName(textLower)
    )
      score += 30;
    if (
      (label.includes('experience') || label.includes('years')) &&
      this.extractYearsOfExperience(textLower)
    )
      score += 30;

    return score;
  }

  /**
   * Process fields and extract values from conversation
   */
  static extractFieldValues(
    conversationHistory: string[],
    fields: Field[]
  ): ExtractionResult[] {
    const conversation = conversationHistory.join(' ').toLowerCase();
    const results: ExtractionResult[] = [];

    for (const field of fields) {
      const matchScore = this.detectFieldMatch(conversation, field.label);

      if (matchScore === 0) continue;

      let value: any = null;
      const confidence = Math.min(matchScore / 50, 1);

      switch (field.type) {
        case 'text':
        case 'textarea':
          // For name fields
          if (field.label.toLowerCase().includes('name')) {
            value = this.extractName(conversation);
          }
          // For email fields
          else if (field.label.toLowerCase().includes('email')) {
            const emails = this.extractEmails(conversation);
            value = emails.length > 0 ? emails[0] : null;
          }
          // For phone fields
          else if (field.label.toLowerCase().includes('phone')) {
            const phones = this.extractPhones(conversation);
            value = phones.length > 0 ? phones[0] : null;
          }
          // For experience years
          else if (
            field.label.toLowerCase().includes('experience') ||
            field.label.toLowerCase().includes('years')
          ) {
            value = this.extractYearsOfExperience(conversation);
          }
          break;

        case 'date':
          const dates = this.extractDates(conversation);
          value = dates.length > 0 ? dates[0] : null;
          break;

        case 'select':
          // Match options from conversation
          if (field.options) {
            for (const option of field.options) {
              if (conversation.includes(option.value.toLowerCase())) {
                value = option.value;
                break;
              }
            }
          }
          break;
      }

      if (value !== null) {
        results.push({
          fieldId: field.id,
          value,
          confidence,
          source: 'local',
        });
      }
    }

    return results;
  }
}
