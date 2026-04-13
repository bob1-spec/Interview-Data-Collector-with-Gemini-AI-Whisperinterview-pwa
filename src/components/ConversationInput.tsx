import React, { useState, useEffect } from 'react';
import { useAppStore } from '../stores/appStore';
import { VoiceRecognitionService } from '../services/voiceRecognition';
import { LocalExtractor } from '../services/extractor';
import { OpenAIExtractor } from '../services/openaiExtractor';
import { Mic, MicOff, Send, Zap, AlertCircle, CheckCircle } from 'lucide-react';

interface ConversationInputProps {
  useAI?: boolean;
}

export const ConversationInput: React.FC<ConversationInputProps> = ({ useAI = false }) => {
  const {
    questionnaire,
    conversationHistory,
    addConversationMessage,
    updateResponse,
    isProcessing,
    setIsProcessing,
  } = useAppStore();

  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [extractionFeedback, setExtractionFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
    count?: number;
  } | null>(null);

  useEffect(() => {
    // Initialize microphone access if Whisper key is available
    const hasWhisperKey = localStorage.getItem('whisperKey');
    if (hasWhisperKey) {
      VoiceRecognitionService.initializeMicrophone().catch((error) => {
        console.warn('Could not access microphone:', error);
      });
      setVoiceSupported(true);
    } else {
      // Check if Web Speech API is supported as fallback
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      setVoiceSupported(!!SpeechRecognition);
    }
  }, []);

  useEffect(() => {
    // Clear feedback after 3 seconds
    if (extractionFeedback) {
      const timer = setTimeout(() => setExtractionFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [extractionFeedback]);

  const extractAndFill = async (text: string, useAIFallback = true) => {
    if (!questionnaire || !text.trim()) return;

    setIsProcessing(true);
    try {
      // First try local extraction
      let results = LocalExtractor.extractFieldValues(
        [text],
        questionnaire.fields
      );

      // If local extraction didn't find enough and AI is enabled, try API
      if (results.length < questionnaire.fields.length && useAI && useAIFallback) {
        try {
          const apiResults = await OpenAIExtractor.extractFieldValues(
            [...conversationHistory, `User: ${text}`],
            questionnaire.fields
          );
          
          // Merge results, preferring higher confidence
          const mergedResults = new Map();
          [...results, ...apiResults].forEach((r) => {
            const existing = mergedResults.get(r.fieldId);
            if (!existing || r.confidence > existing.confidence) {
              mergedResults.set(r.fieldId, r);
            }
          });
          results = Array.from(mergedResults.values());
        } catch (error) {
          console.warn('API extraction failed, using local only:', error);
        }
      }

      // Update responses
      results.forEach((result) => {
        updateResponse(result.fieldId, result.value);
      });

      if (results.length > 0) {
        setExtractionFeedback({
          type: 'success',
          message: `Auto-filled ${results.length} field(s)`,
          count: results.length,
        });
      } else {
        setExtractionFeedback({
          type: 'error',
          message: 'No fields matched. Try being more specific.',
        });
      }
    } catch (error) {
      setExtractionFeedback({
        type: 'error',
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
      console.error('Extraction error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVoiceInput = async () => {
    const hasWhisperKey = localStorage.getItem('whisperKey');

    if (isListening) {
      if (hasWhisperKey) {
        // Stop MediaRecorder and transcribe with Whisper
        try {
          setIsProcessing(true);
          const audioBlob = await VoiceRecognitionService.stopRecording();
          if (audioBlob) {
            const transcribedText = await VoiceRecognitionService.transcribeWithWhisper(audioBlob);
            setTranscript(transcribedText);
            if (transcribedText.trim()) {
              addConversationMessage(`You: ${transcribedText}`);
              await extractAndFill(transcribedText);
            }
            setTranscript('');
          }
        } catch (error) {
          setExtractionFeedback({
            type: 'error',
            message: `Whisper error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          });
          console.error('Whisper transcription error:', error);
        } finally {
          setIsProcessing(false);
          setIsListening(false);
        }
      } else {
        // Stop Web Speech API
        VoiceRecognitionService.stopWebSpeech();
        setIsListening(false);
        if (transcript.trim()) {
          addConversationMessage(`You: ${transcript}`);
          await extractAndFill(transcript);
          setTranscript('');
        }
      }
    } else {
      setTranscript('');

      if (hasWhisperKey) {
        // Use Whisper (via MediaRecorder)
        try {
          const initialized = await VoiceRecognitionService.initializeMicrophone();
          if (!initialized) {
            setExtractionFeedback({
              type: 'error',
              message: 'Microphone access denied. Please allow microphone access.',
            });
            return;
          }

          const started = VoiceRecognitionService.startRecording();
          if (!started) {
            setExtractionFeedback({
              type: 'error',
              message: 'Failed to start recording.',
            });
            return;
          }

          setTranscript('Recording...');
          setIsListening(true);
        } catch (error) {
          setExtractionFeedback({
            type: 'error',
            message: `Microphone error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          });
        }
      } else {
        // Use Web Speech API (fallback)
        const supported = VoiceRecognitionService.startWebSpeechListening(
          (result) => {
            setTranscript(result.text);
          },
          (error) => {
            setExtractionFeedback({
              type: 'error',
              message: `Voice error: ${error}`,
            });
          }
        );

        if (!supported) {
          setVoiceSupported(false);
          setExtractionFeedback({
            type: 'error',
            message: 'Voice input not supported in your browser.',
          });
        } else {
          setIsListening(true);
        }
      }
    }
  };

  const handleTextInput = async () => {
    if (!inputText.trim()) return;

    addConversationMessage(`You: ${inputText}`);
    await extractAndFill(inputText);
    setInputText('');
  };

  const handleAIExtraction = async () => {
    if (!inputText.trim()) return;
    
    setIsProcessing(true);
    try {
      if (!questionnaire) return;
      const results = await OpenAIExtractor.extractFieldValues(
        [...conversationHistory, `You: ${inputText}`],
        questionnaire.fields
      );
      results.forEach((r) => updateResponse(r.fieldId, r.value));
      addConversationMessage(`You: ${inputText}`);
      setInputText('');
      setExtractionFeedback({
        type: 'success',
        message: `AI filled ${results.length} field(s)`,
        count: results.length,
      });
    } catch (error) {
      setExtractionFeedback({
        type: 'error',
        message: `AI error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="conversation-input">
      <h3>Add Information</h3>

      {extractionFeedback && (
        <div className={`feedback-message feedback-${extractionFeedback.type}`}>
          {extractionFeedback.type === 'success' ? (
            <CheckCircle size={18} />
          ) : (
            <AlertCircle size={18} />
          )}
          <span>{extractionFeedback.message}</span>
        </div>
      )}

      <div className="input-methods">
        {voiceSupported && (
          <div className="voice-input-section">
            <button
              onClick={handleVoiceInput}
              className={`btn btn-voice ${isListening ? 'active' : ''}`}
              disabled={isProcessing}
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              {isListening ? 'Stop Recording' : 'Start Voice Input'}
            </button>
            {transcript && (
              <div className="transcript-preview">
                <strong>Heard:</strong> {transcript}
              </div>
            )}
          </div>
        )}

        <div className="text-input-section">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Or type information here...  (Ctrl+Enter to submit)"
            className="form-input"
            rows={3}
            disabled={isProcessing || isListening}
            onKeyDown={(e) => {
              if (e.ctrlKey && e.key === 'Enter') {
                handleTextInput();
              }
            }}
          />
          <div className="button-group">
            <button
              onClick={handleTextInput}
              className="btn btn-primary"
              disabled={isProcessing || !inputText.trim()}
            >
              <Send size={18} />
              Submit
            </button>

            {useAI && (
              <button
                onClick={handleAIExtraction}
                className="btn btn-secondary"
                disabled={isProcessing || !inputText.trim()}
              >
                <Zap size={18} />
                AI Auto-fill
              </button>
            )}
          </div>
        </div>
      </div>

      {conversationHistory.length > 0 && (
        <div className="conversation-history">
          <h4>Conversation History ({conversationHistory.length})</h4>
          <div className="history-messages">
            {conversationHistory.slice(-5).map((msg, idx) => (
              <div
                key={idx}
                className={`message ${msg.startsWith('You:') ? 'user-message' : 'assistant-message'}`}
              >
                {msg}
              </div>
            ))}
          </div>
        </div>
      )}

      {isProcessing && (
        <div className="processing-indicator">
          <span className="spinner"></span>
          Processing...
        </div>
      )}
    </div>
  );
};
