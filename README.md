# Interview Data Collector PWA

A modern Progressive Web App (PWA) designed for employers to collect and manage interview data using AI-powered automatic field extraction from conversations.

## Features

### Core Features
- ✅ **Dynamic Questionnaires** - Create, edit, and remove form fields on-the-fly
- 🤖 **AI-Powered Extraction** - Automatically extract and fill form fields from conversations using Claude AI
- 🎤 **Voice Input** - Record conversations directly in the app (with speech-to-text)
- 📝 **Text Input** - Type or paste information for manual data entry
- 📄 **PDF Export** - Generate professional PDF documents of completed questionnaires
- 📱 **PWA Support** - Install as a standalone app, works offline
- 💾 **Local Storage** - All data stored locally with IndexedDB for privacy
- 🔄 **Cloud Sync** - Optional Firebase integration for data synchronization

### Advanced Features
- Conversation history tracking
- Real-time field extraction feedback
- Multiple questionnaire templates
- Batch PDF export for multiple responses
- Custom field types (text, textarea, dropdown, date, time, datetime)
- Required field validation
- Progress tracking

## Tech Stack

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite
- **State Management**: Zustand
- **Forms**: React Hook Form
- **AI**: Anthropic Claude API
- **PDF Generation**: jsPDF with html2canvas
- **Storage**: IndexedDB, Firebase
- **UI Framework**: Lucide Icons
- **Styling**: Modern CSS with Flexbox/Grid

## Getting Started

### Prerequisites
- Node.js 16+ and npm
- Anthropic API Key (for AI features - optional but recommended)

### Installation

1. Navigate to the project directory:
```bash
cd interview-pwa
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The app will open at `http://localhost:5173`

### First Time Setup

1. **Create a Questionnaire**
   - Click "Create New Questionnaire"
   - Add a title and description
   - Design your form by adding fields

2. **Configure AI (Optional)**
   - On the home screen, scroll to "Setup AI"
   - Enter your Anthropic API Key
   - Click "Enable AI" for intelligent field extraction

3. **Fill the Questionnaire**
   - Either use Voice Input or Text Input
   - The app will automatically extract relevant information
   - Manually edit fields as needed
   - View real-time progress

4. **Export to PDF**
   - Click "Export to PDF" when done
   - Enter candidate and interviewer names
   - Download the professional PDF report

## Usage Guide

### Creating a Questionnaire

1. Go to "Create New Questionnaire"
2. Enter a title and optional description
3. Use the Editor to add fields:
   - **Text** - Simple text input
   - **Text Area** - Multi-line text
   - **Dropdown** - Select from predefined options
   - **Date** - Date picker
   - **Time** - Time picker
   - **Date & Time** - Combined picker
4. Mark fields as required if needed
5. Use drag-to-reorder (upcoming feature)

### Filling the Form

#### Voice Input
- Click "Start Voice Input" to begin recording
- Speak naturally about the candidate or information
- The app extracts relevant data automatically
- Transcript shows what was heard

#### Text Input
- Type or paste information about the candidate
- Use "Submit" to process normal extraction
- Use "AI Auto-fill" for intelligent extraction (requires API key)
- Press `Ctrl+Enter` as a keyboard shortcut

### AI Extraction

The app uses two extraction methods:

**Local Extraction** (Always available)
- Pattern matching for emails, phones, dates
- Name and years of experience detection
- Keyword-based field matching

**AI Extraction** (Requires Anthropic API Key)
- Contextual understanding of conversations
- Smart inference from natural language
- Higher accuracy for complex fields
- Confidence scoring


### PDF Export

1. Complete the questionnaire with desired information
2. Click "Export to PDF"
3. Enter:
   - Candidate Name
   - Interviewer Name
4. Click "Download PDF"
5. Open or save the professional report

## Configuration

### API Keys

#### Anthropic Claude API
1. Get your API key from [Anthropic Console](https://console.anthropic.com)
2. Enter it in the "Setup AI" section when first opening the app
3. The key is stored locally in your browser (never sent to our servers)

### Customization

Edit `src/App.css` and component files to customize the appearance and behavior.

## Development

### Building for Production

```bash
npm run build
```

Output will be in the `dist/` directory, ready to deploy.

### Linting

```bash
npm run lint
```

### Project Structure

```
src/
├── components/          # React components
│   ├── ConversationInput.tsx
│   ├── QuestionnaireEditor.tsx
│   ├── QuestionnaireRenderer.tsx
│   └── FieldComponents.tsx
├── services/           # Business logic
│   ├── extractor.ts      # Local field extraction
│   ├── openaiExtractor.ts # AI-powered extraction
│   ├── pdfExporter.ts     # PDF generation
│   ├── voiceRecognition.ts
│   └── indexedDB.ts       # Data storage
├── stores/            # Zustand store
│   └── appStore.ts
├── types/             # TypeScript types
│   └── index.ts
├── App.tsx
└── main.tsx
```

## PWA Installation

### On Windows
1. Open the app in Edge or Chrome
2. Click the "Install" button in the address bar
3. Choose where to install
4. Launch from Start Menu or Desktop shortcut

### On macOS
1. Open the app in Safari or Chrome
2. Click "Share" → "Add to Dock" (Safari) or use the menu (Chrome)
3. Launch from Applications

### On Mobile
1. Open the app in browser
2. Tap "Share" → "Add to Home Screen"
3. Tap the icon on your home screen

## Offline Support

The app includes a service worker that:
- Caches the app shell for offline access
- Syncs data when back online
- Shows estimated data from the last visit if offline

Note: AI extraction requires internet connection.

## Data Privacy

All data is stored locally on your device:
- Questionnaires stored in IndexedDB
- Responses never leave your device
- API keys stored locally (not transmitted to our servers)
- Optional Firebase integration for backup (your choice)

## Troubleshooting

### AI Features Not Working
- Ensure you've entered a valid Anthropic API Key
- Check your API key has remaining credits
- Verify internet connection

### Service Worker Issues
- Clear browser cache (Settings → Clear browsing data)
- Uninstall app and reinstall
- Check browser console for errors

### Data Not Saving
- Check browser storage permissions
- Ensure IndexedDB is not disabled
- Try clearing cache and reloading

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

## Performance Tips

- Keep questionnaires under 20 fields for best performance
- Use voice input for faster data entry
- Export regularly to avoid losing data
- Clear old responses periodically

## Roadmap

- [ ] Drag-to-reorder fields
- [ ] Questionnaire templates library
- [ ] Multi-language support
- [ ] Advanced analytics
- [ ] Team collaboration features
- [ ] Mobile app release
- [ ] Batch processing

## Contributing

Found a bug or have a feature request? Create an issue or submit a pull request.

## License

MIT License - feel free to use in personal or commercial projects.

## Support

For issues, feature requests, or questions, please create an issue in the repository.

## Credits

Built with:
- React
- Vite
- Zustand
- Anthropic Claude API
- Lucide Icons

---

Happy interviewing! 🎯
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
