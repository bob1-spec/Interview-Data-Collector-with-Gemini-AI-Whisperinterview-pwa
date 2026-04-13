import { useState, useEffect } from 'react';
import { useAppStore } from './stores/appStore';
import { IndexedDBService } from './services/indexedDB';
import { QuestionnaireEditor } from './components/QuestionnaireEditor';
import { QuestionnaireRenderer } from './components/QuestionnaireRenderer';
import { ConversationInput } from './components/ConversationInput';
import { FileText, Plus, Settings } from 'lucide-react';
import './App.css';

type AppView = 'home' | 'editor' | 'fill' | 'view';

function App() {
  const [view, setView] = useState<AppView>('home');
  const { questionnaire, createNewQuestionnaire } = useAppStore();
  const [useAI, setUseAI] = useState(false);
  const [geminiKey, setGeminiKey] = useState('');
  const [whisperKey, setWhisperKey] = useState('');

  useEffect(() => {
    IndexedDBService.initialize().catch(console.error);

    // Register service worker for PWA (disabled temporarily for debugging)
    // if ('serviceWorker' in navigator) {
    //   navigator.serviceWorker.register('/sw.js').catch(console.error);
    // }

    // Load API keys from environment variables or localStorage
    const envGeminiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const envWhisperKey = import.meta.env.VITE_WHISPER_API_KEY;
    
    const storedGeminiKey = localStorage.getItem('geminiKey') || envGeminiKey;
    const storedWhisperKey = localStorage.getItem('whisperKey') || envWhisperKey;

    if (storedGeminiKey) {
      (async () => {
        try {
          const extractor = await import('./services/openaiExtractor');
          const voiceService = await import('./services/voiceRecognition');
          
          extractor.OpenAIExtractor.initialize(storedGeminiKey);
          if (storedWhisperKey) {
            voiceService.VoiceRecognitionService.setWhisperKey(storedWhisperKey);
          }

          setUseAI(true);
        } catch (error) {
          console.error('Failed to restore API services:', error);
        }
      })();
    }
  }, []);

  const handleCreateNew = () => {
    createNewQuestionnaire('New Questionnaire', 'Interview template');
    setView('editor');
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>
            <FileText size={24} />
            Interview Data Collector
          </h1>
          {useAI && (
            <div className="api-status">
              <button className="btn btn-secondary btn-small" onClick={() => setUseAI(false)}>
                AI Enabled ✓
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="app-container">
        {view === 'home' && (
          <div className="home-view">
            <div className="welcome-card">
              <h2>Welcome to Interview Data Collector</h2>
              <p>Create dynamic questionnaires and use AI to auto-fill fields from conversations.</p>

              <div className="home-actions">
                <button onClick={handleCreateNew} className="btn btn-primary btn-large">
                  <Plus size={20} />
                  Create New Questionnaire
                </button>
              </div>

              {!useAI && (
                <div className="api-setup-card">
                  <h3>
                    <Settings size={18} />
                    Setup AI & Voice (Optional - Use Free Services!)
                  </h3>
                  <p>Enable AI-powered field extraction and speech-to-text transcription.</p>
                  
                  <div className="api-inputs">
                    <div>
                      <label>Google Gemini API Key (Free - for AI extraction)</label>
                      <input
                        type="password"
                        placeholder="Get free at makersuite.google.com/app/apikey"
                        value={geminiKey}
                        onChange={(e) => setGeminiKey(e.target.value)}
                        className="form-input"
                      />
                      <small>32,000 tokens/day free tier</small>
                    </div>
                    
                    <div>
                      <label>OpenAI Whisper API Key (Optional - for voice transcription)</label>
                      <input
                        type="password"
                        placeholder="Get free trial at platform.openai.com/api-keys"
                        value={whisperKey}
                        onChange={(e) => setWhisperKey(e.target.value)}
                        className="form-input"
                      />
                      <small>Without this, Web Speech API (browser-native) will be used</small>
                    </div>
                  </div>
                  
                  <button
                    onClick={async () => {
                      if (geminiKey.trim()) {
                        try {
                          const extractor = await import('./services/openaiExtractor');
                          const voiceService = await import('./services/voiceRecognition');
                          
                          extractor.OpenAIExtractor.initialize(geminiKey);
                          if (whisperKey.trim()) {
                            voiceService.VoiceRecognitionService.setWhisperKey(whisperKey);
                            localStorage.setItem('whisperKey', whisperKey);
                          }
                          localStorage.setItem('geminiKey', geminiKey);
                          
                          setUseAI(true);
                          alert('AI & Voice services initialized successfully!');
                        } catch (error) {
                          alert('Failed to initialize services: ' + (error instanceof Error ? error.message : 'Unknown error'));
                        }
                      } else {
                        alert('Please enter at least a Gemini API key');
                      }
                    }}
                    className="btn btn-secondary"
                  >
                    Enable Services
                  </button>
                </div>
              )}

              <div className="features-grid">
                <div className="feature-card">
                  <h4>Dynamic Fields</h4>
                  <p>Add, edit, or remove fields as needed</p>
                </div>
                <div className="feature-card">
                  <h4>Voice Input</h4>
                  <p>Record conversations and auto-fill data</p>
                </div>
                <div className="feature-card">
                  <h4>AI Powered</h4>
                  <p>Intelligent data extraction from conversations</p>
                </div>
                <div className="feature-card">
                  <h4>PDF Export</h4>
                  <p>Generate professional PDF reports</p>
                </div>
                <div className="feature-card">
                  <h4>Offline Support</h4>
                  <p>Works without internet connection</p>
                </div>
                <div className="feature-card">
                  <h4>Cloud Sync</h4>
                  <p>Sync your data across devices</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'editor' && questionnaire && (
          <div className="editor-view">
            <nav className="view-nav">
              <button onClick={() => setView('home')} className="btn btn-secondary">
                ← Back
              </button>
              <button
                onClick={() => setView('fill')}
                className="btn btn-primary"
                disabled={questionnaire.fields.length === 0}
              >
                Next: Fill Form →
              </button>
            </nav>
            <QuestionnaireEditor />
          </div>
        )}

        {view === 'fill' && questionnaire && (
          <div className="fill-view">
            <nav className="view-nav">
              <button onClick={() => setView('editor')} className="btn btn-secondary">
                ← Edit Template
              </button>
              <button onClick={() => setView('view')} className="btn btn-primary">
                View & Export →
              </button>
            </nav>
            <div className="fill-content">
              <div className="left-panel">
                <ConversationInput useAI={useAI} />
              </div>
              <div className="right-panel">
                <QuestionnaireRenderer />
              </div>
            </div>
          </div>
        )}

        {view === 'view' && questionnaire && (
          <div className="view-view">
            <nav className="view-nav">
              <button onClick={() => setView('home')} className="btn btn-secondary">
                ← Home
              </button>
              <button onClick={() => setView('fill')} className="btn btn-secondary">
                ← Continue Editing
              </button>
            </nav>
            <QuestionnaireRenderer />
          </div>
        )}
      </div>

      <footer className="app-footer">
        <p>Interview Data Collector PWA v1.0 | Works offline | Local data storage</p>
      </footer>
    </div>
  );
}

export default App;
