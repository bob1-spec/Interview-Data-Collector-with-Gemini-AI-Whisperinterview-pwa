import { create } from 'zustand';
import type { Questionnaire, Field, Response } from '../types';

interface AppStore {
  // Questionnaire state
  questionnaire: Questionnaire | null;
  setQuestionnaire: (questionnaire: Questionnaire) => void;
  addField: (field: Field) => void;
  updateField: (fieldId: string, updates: Partial<Field>) => void;
  removeField: (fieldId: string) => void;

  // Conversation state
  conversationHistory: string[];
  addConversationMessage: (message: string) => void;
  clearConversation: () => void;

  // Response state
  responses: Record<string, any>;
  updateResponse: (fieldId: string, value: any) => void;
  clearResponses: () => void;

  // UI state
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
  syncStatus: 'synced' | 'syncing' | 'offline';
  setSyncStatus: (status: 'synced' | 'syncing' | 'offline') => void;

  // Helper methods
  createNewQuestionnaire: (title: string, description?: string) => void;
  getCurrentResponse: () => Response | null;
}

export const useAppStore = create<AppStore>((set, get) => ({
  questionnaire: null,

  setQuestionnaire: (questionnaire) => set({ questionnaire }),

  addField: (field) => set((state) => {
    if (!state.questionnaire) return state;
    return {
      questionnaire: {
        ...state.questionnaire,
        fields: [...state.questionnaire.fields, field],
        updatedAt: new Date(),
      },
    };
  }),

  updateField: (fieldId, updates) => set((state) => {
    if (!state.questionnaire) return state;
    return {
      questionnaire: {
        ...state.questionnaire,
        fields: state.questionnaire.fields.map((f) =>
          f.id === fieldId ? { ...f, ...updates } : f
        ),
        updatedAt: new Date(),
      },
    };
  }),

  removeField: (fieldId) => set((state) => {
    if (!state.questionnaire) return state;
    return {
      questionnaire: {
        ...state.questionnaire,
        fields: state.questionnaire.fields.filter((f) => f.id !== fieldId),
        updatedAt: new Date(),
      },
    };
  }),

  conversationHistory: [],

  addConversationMessage: (message) => set((state) => ({
    conversationHistory: [...state.conversationHistory, message],
  })),

  clearConversation: () => set({ conversationHistory: [] }),

  responses: {},

  updateResponse: (fieldId, value) => set((state) => ({
    responses: {
      ...state.responses,
      [fieldId]: value,
    },
  })),

  clearResponses: () => set({ responses: {} }),

  isProcessing: false,
  setIsProcessing: (processing) => set({ isProcessing: processing }),

  syncStatus: 'offline',
  setSyncStatus: (status) => set({ syncStatus: status }),

  createNewQuestionnaire: (title, description) => set({
    questionnaire: {
      id: Date.now().toString(),
      title,
      description,
      fields: [
        {
          id: 'field-full-name',
          label: 'Full Name',
          type: 'text',
          required: true,
        },
        {
          id: 'field-email',
          label: 'Email',
          type: 'text',
          placeholder: 'example@domain.com',
          required: true,
        },
        {
          id: 'field-phone',
          label: 'Phone Number',
          type: 'text',
          placeholder: '+1 (555) 123-4567',
          required: false,
        },
        {
          id: 'field-position',
          label: 'Position/Role',
          type: 'text',
          required: false,
        },
        {
          id: 'field-date',
          label: 'Interview Date',
          type: 'date',
          required: true,
        },
        {
          id: 'field-experience',
          label: 'Years of Experience',
          type: 'text',
          required: false,
        },
        {
          id: 'field-notes',
          label: 'Additional Notes',
          type: 'textarea',
          required: false,
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    responses: {},
    conversationHistory: [],
  }),

  getCurrentResponse: () => {
    const state = get();
    if (!state.questionnaire) return null;

    return {
      id: Date.now().toString(),
      questionnaireId: state.questionnaire.id,
      responses: state.responses,
      conversationHistory: state.conversationHistory,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  },
}));
