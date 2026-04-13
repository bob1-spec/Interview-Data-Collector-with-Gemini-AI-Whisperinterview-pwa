export type FieldType = 'text' | 'textarea' | 'select' | 'date' | 'time' | 'datetime';

export interface SelectOption {
  label: string;
  value: string;
}

export interface Field {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: SelectOption[];  // For select fields
  value?: any;
}

export interface Questionnaire {
  id: string;
  title: string;
  description?: string;
  fields: Field[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Response {
  id: string;
  questionnaireId: string;
  responses: Record<string, any>;  // fieldId -> value
  conversationHistory: string[];
  createdAt: Date;
  updatedAt: Date;
  candidateName?: string;
}

export interface ExtractionResult {
  fieldId: string;
  value: any;
  confidence: number;
  source: 'local' | 'api';
}

export interface PdfExportOptions {
  filename?: string;
  title?: string;
  interviewerName?: string;
  candidateName?: string;
  date?: Date;
}
