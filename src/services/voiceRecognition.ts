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
   */
  static async startRecording(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        this.audioChunks.push(event.data);
      };

      this.mediaRecorder.start();
      console.log('Audio recording started');
    } catch (error) {
      console.error('Error starting audio recording:', error);
      throw error;
    }
  }

  /**
   * Stop recording audio and get blob
   */
  static stopRecording(): Promise<Blob | null> {
    if (!this.mediaRecorder) return Promise.resolve(null);

    return new Promise((resolve) => {
      this.mediaRecorder!.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        console.log('Audio recording stopped');

        // Stop all streams
        this.mediaRecorder!.stream.getTracks().forEach((track) => track.stop());

        resolve(audioBlob);
      };

      this.mediaRecorder!.stop();
    });
  }

  /**
   * Convert audio blob to base64
   */
  static blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Convert audio blob to WAV format (for better API compatibility)
   */
  static async convertToWav(blob: Blob): Promise<Blob> {
    const arrayBuffer = await blob.arrayBuffer();
    const audioContext = new (window as any).AudioContext();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    // Create WAV file
    const numberOfChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;

    const bytesPerSample = bitDepth / 8;
    const blockAlign = numberOfChannels * bytesPerSample;

    const channelData = [];
    for (let i = 0; i < numberOfChannels; i++) {
      channelData.push(audioBuffer.getChannelData(i));
    }

    const samples = interleave(channelData);
    const dataLength = samples.length * bytesPerSample;
    const buffer = new ArrayBuffer(44 + dataLength);
    const view = new DataView(buffer);

    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(36, 'data');
    view.setUint32(40, dataLength, true);

    let index = 44;
    const volume = 0.8;
    for (let i = 0; i < samples.length; i++) {
      view.setInt16(index, samples[i] * (0x7fff * volume), true);
      index += 2;
    }

    return new Blob([buffer], { type: 'audio/wav' });
  }
}

function interleave(channels: Float32Array[]): Float32Array {
  const length = channels[0].length * channels.length;
  const result = new Float32Array(length);
  let index = 0;

  for (let i = 0; i < channels[0].length; i++) {
    for (let j = 0; j < channels.length; j++) {
      result[index++] = channels[j][i];
    }
  }

  return result;
}
