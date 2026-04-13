export interface RecognitionResult {
  text: string;
  isFinal: boolean;
}

let whisperApiKey: string | null = null;

export class VoiceRecognitionService {
  private static mediaRecorder: MediaRecorder | null = null;
  private static audioChunks: Blob[] = [];
  private static stream: MediaStream | null = null;

  /**
   * Set Whisper API key for speech-to-text
   */
  static setWhisperKey(apiKey: string) {
    whisperApiKey = apiKey;
  }

  /**
   * Initialize microphone access
   */
  static async initializeMicrophone(): Promise<boolean> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(this.stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        this.audioChunks.push(event.data);
      };

      return true;
    } catch (error) {
      console.error('Microphone access denied:', error);
      return false;
    }
  }

  /**
   * Start recording audio
   */
  static startRecording(): boolean {
    if (!this.mediaRecorder) {
      console.error('MediaRecorder not initialized');
      return false;
    }

    this.audioChunks = [];
    this.mediaRecorder.start();
    return true;
  }

  /**
   * Stop recording and get audio blob
   */
  static async stopRecording(): Promise<Blob | null> {
    if (!this.mediaRecorder) {
      return null;
    }

    return new Promise((resolve) => {
      this.mediaRecorder!.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.audioChunks = [];
        resolve(audioBlob);
      };
      this.mediaRecorder!.stop();
    });
  }

  /**
   * Send audio to Whisper API for transcription
   */
  static async transcribeWithWhisper(audioBlob: Blob): Promise<string> {
    if (!whisperApiKey) {
      throw new Error('Whisper API key not set');
    }

    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', 'whisper-1');
    formData.append('language', 'en');

    try {
      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${whisperApiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Whisper API error: ${error.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      return data.text;
    } catch (error) {
      console.error('Whisper transcription error:', error);
      throw error;
    }
  }

  /**
   * Start listening using browser Web Speech API (fallback when no Whisper key)
   */
  static startWebSpeechListening(
    onResult: (result: RecognitionResult) => void,
    onError?: (error: string) => void
  ): boolean {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('Web Speech API not supported');
      return false;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.language = 'en-US';

    recognition.onstart = () => {
      console.log('Web Speech recognition started');
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        onResult({
          text: finalTranscript,
          isFinal: true,
        });
      } else if (interimTranscript) {
        onResult({
          text: interimTranscript,
          isFinal: false,
        });
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Web Speech recognition error:', event.error);
      if (onError) {
        onError(event.error);
      }
    };

    recognition.onend = () => {
      console.log('Web Speech recognition ended');
    };

    try {
      recognition.start();
      (window as any).currentRecognition = recognition; // Store for cleanup
      return true;
    } catch (error) {
      console.error('Error starting recognition:', error);
      return false;
    }
  }

  /**
   * Stop web speech recognition
   */
  static stopWebSpeech(): void {
    const recognition = (window as any).currentRecognition;
    if (recognition) {
      recognition.stop();
    }
  }

  /**
   * Clean up audio resources
   */
  static cleanup(): void {
    if (this.mediaRecorder) {
      try {
        this.mediaRecorder.stop();
      } catch (e) {
        // Already stopped
      }
    }

    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
    }

    this.mediaRecorder = null;
    this.stream = null;
    this.audioChunks = [];
  }
}
