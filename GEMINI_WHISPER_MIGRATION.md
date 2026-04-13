# Gemini AI + Whisper Voice Migration Guide

## Overview

The Interview PWA has been upgraded to use **Google Gemini 1.5** for AI-powered field extraction and **OpenAI Whisper** for professional speech-to-text transcription. The app falls back gracefully to Web Speech API if Whisper is unavailable.

## What Changed

### 1. **AI Extraction Service** (`src/services/openaiExtractor.ts`)
- **Previous:** Used Anthropic Claude API or Groq
- **Now:** Uses Google Gemini 1.5 API
- **Benefits:** 
  - Free tier: 32,000 tokens/day
  - Excellent conversation understanding
  - No SDK dependency (direct Fetch API)

### 2. **Voice Recognition Service** (`src/services/voiceRecognition.ts`)
- **Completely rewritten** with dual-mode support:
  
  **Mode 1: Whisper API (Professional)**
  - Uses OpenAI Whisper API for accurate transcription
  - Records audio via `MediaRecorder`
  - Requires API key: `platform.openai.com/api-keys`
  
  **Mode 2: Web Speech API (Fallback)**
  - Browser-native speech recognition
  - No API key needed
  - Works in most modern browsers
  - Used when no Whisper key is provided

- **New Methods:**
  - `setWhisperKey()` - Configure Whisper API
  - `initializeMicrophone()` - Request microphone access
  - `startRecording()` - Begin audio capture
  - `stopRecording()` - Stop and return audio blob
  - `transcribeWithWhisper()` - Send to Whisper API
  - `startWebSpeechListening()` - Use browser speech API
  - `stopWebSpeech()` - Stop browser recognition
  - `cleanup()` - Release audio resources

### 3. **App Component** (`src/App.tsx`)
- **New dual API setup screen** with separate fields for:
  - Google Gemini API Key
  - OpenAI Whisper API Key (optional)
- **Auto-initialization:** Loads stored keys from localStorage on app startup
- **Better UX:** Clear distinction between required and optional services

### 4. **Conversation Input** (`src/components/ConversationInput.tsx`)
- **Smart voice routing:**
  - If Whisper key exists → Use Whisper (MediaRecorder + Fetch)
  - If no Whisper key → Fall back to Web Speech API
- **New recording states:**
  - "Recording..." status during Whisper capture
  - Visual feedback for microphone access requests
- **Improved error handling** for both Whisper and Web Speech workflows

### 5. **Styling** (`src/App.css`)
- **New `.api-inputs` grid layout** for multiple API configurations
- **Improved visual organization** of optional/required services
- **Better responsive design** for phone/tablet usage

### 6. **Package.json**
- No additional npm dependencies needed
- Already had gh-pages for GitHub Pages deployment
- Uses native browser APIs for efficiency

## Getting Started

### Step 1: Get Free API Keys

**Google Gemini (REQUIRED):**
```
https://makersuite.google.com/app/apikey
- Click "Create API Key"
- Copy the key
- Free tier: 32,000 tokens/day
```

**OpenAI Whisper (OPTIONAL):**
```
https://platform.openai.com/api-keys
- Sign up or log in
- Create new API key
- Free trial includes credits
- Fallback is Web Speech API if not configured
```

### Step 2: Configure the App

1. **On first launch**, you'll see "Setup AI & Voice (Optional)" section
2. **Paste your Gemini API key** in the first field (required for AI extraction)
3. **Optionally paste Whisper key** in the second field (for better transcription)
4. Click **"Enable Services"**
5. Once configured, keys are stored in browser localStorage and auto-load on restart

### Step 3: Using Voice Input

**With Whisper key:**
- Click "Start Voice Input"
- Speak your content
- Audio is recorded locally, sent to Whisper API
- Transcription appears automatically
- Fields auto-fill if matched

**Without Whisper key (Web Speech API):**
- Browser requests microphone permission
- Real-time transcription appears as you speak
- No data sent to external servers
- Perfect for privacy-conscious usage

## How the Dual-Mode Voice Works

```
User clicks "Voice Input"
    ↓
Check if Whisper key is set
    ├─ YES → Use Whisper (MediaRecorder + Fetch API)
    │        Recording starts, bytes captured
    │        User speaks...
    │        Click "Stop Recording"
    │        Audio sent to Whisper API
    │        API returns transcript
    │        ↓ Auto-fill fields
    │
    └─ NO → Use Web Speech (Browser native)
             Browser speech recognition API starts
             User speaks...
             Click "Stop Recording"
             Browser transcribes locally
             ↓ Auto-fill fields
```

## API Usage & Limits

### Google Gemini 1.5
- **Free Tier:** 32,000 tokens/day
- **Per Day Reset:** 12:00 AM UTC
- **Perfect for:** Normal interview workflows
- **Typical Usage:** ~500-2,000 tokens per interview

### OpenAI Whisper
- **Free Trial:** $5 credits (covers ~500,000 seconds of audio)
- **Production:** $0.02 per 60 seconds
- **Optional:** Falls back to Web Speech API if not configured
- **Excellent for:** Professional accuracy needed

### Web Speech API (Fallback)
- **Cost:** Free
- **Privacy:** All processing happens in browser
- **Accuracy:** Good for English, varies by browser
- **No Limits:** Unlimited usage

## Architecture Benefits

### 1. **Zero Backend Required**
- All data stored locally first
- IndexedDB for questionnaires
- LocalStorage for API keys
- No server-side infrastructure

### 2. **Progressive Enhancement**
- Core app works without any API keys
- Add Gemini for AI extraction
- Add Whisper for better transcription
- Each layer is optional

### 3. **Online & Offline**
- Service Worker enables offline mode
- Data synced when online
- Voice input works offline (Web Speech API)
- AI extraction works when online

### 4. **Privacy-First**
- User controls API key storage
- Understands what data goes where
- Can disable external APIs completely
- All questionnaire data stays local

## File Structure Reference

```
src/
├── services/
│   ├── openaiExtractor.ts      ← Google Gemini integration
│   ├── voiceRecognition.ts     ← Whisper + Web Speech
│   ├── extractor.ts            ← Local pattern matching
│   ├── pdfExporter.ts          ← PDF generation
│   └── indexedDB.ts            ← Local database
├── components/
│   ├── ConversationInput.tsx   ← Voice input + text
│   ├── QuestionnaireEditor.tsx ← Create questionnaires
│   └── QuestionnaireRenderer.tsx ← Fill forms
├── stores/
│   └── appStore.ts             ← Zustand state
├── App.tsx                      ← Main setup & API keys
└── App.css                      ← Styling

public/
└── sw.js                        ← Service worker
```

## Environment Variables (Optional)

For development, you can set API keys as environment variables:

```bash
# .env.local (create this file)
VITE_GEMINI_API_KEY=your_gemini_key
VITE_WHISPER_API_KEY=your_whisper_key
```

Then load in App.tsx:
```typescript
const geminiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const whisperKey = import.meta.env.VITE_WHISPER_API_KEY || '';
```

## Troubleshooting

### "Gemini API error: Invalid API key"
- Verify key is correct at makersuite.google.com/app/apikey
- Check key hasn't expired
- Ensure it's a valid Project API Key

### "Whisper API error: Invalid authentication"
- Verify key at platform.openai.com/api-keys
- Check you've used correct key type (API keys, not tokens)
- Ensure API key has proper permissions

### "Microphone access denied"
- Allow microphone permission in browser
- Try in incognito/private mode
- Check browser microphone settings
- Try clearing browser cache

### "Web Speech API not supported"
- Use Chrome, Edge, Safari, or Firefox
- Not supported in IE or very old browsers
- If unavailable, only text input works (still functional)

### "Audio not transcribing"
- For Whisper: Check internet connection
- Check Whisper API key validity
- Verify you spoke clearly
- Try shorter audio clips (under 25 MB)

## Migration Checklist

If upgrading from old version:

- [ ] Update `src/services/voiceRecognition.ts`
- [ ] Update `src/services/openaiExtractor.ts`
- [ ] Update `src/App.tsx`
- [ ] Update `src/components/ConversationInput.tsx`
- [ ] Update `src/App.css`
- [ ] Clear browser localStorage (optional): `localStorage.clear()`
- [ ] Run `npm install` (no new dependencies)
- [ ] Run `npm run build` to verify compilation
- [ ] Test voice input with both APIs
- [ ] Test text extraction with Gemini
- [ ] Test PDF export

## Future Enhancements

Possible improvements:
- [ ] Voice input in multiple languages
- [ ] More AI models (Claude, GPT-4)
- [ ] Real-time subtitle generation
- [ ] Audio file upload support
- [ ] Conversation analytics
- [ ] Voice command shortcuts

## Support & Questions

For issues:
1. Check browser console (F12 → Console)
2. Verify API keys are correct
3. Test with different browser
4. Check if APIs have rate limits reached
5. Refer to official API docs:
   - Gemini: https://ai.google.dev/
   - Whisper: https://platform.openai.com/docs/guides/speech-to-text
   - Web Speech: MDN Web Docs

---

**Last Updated:** April 2026
**Version:** 2.0 (Gemini + Whisper)
