# Interview Data Collector PWA - Complete Setup Guide

## What's Been Built

Your Interview Data Collector PWA is now feature-complete with all requested functionality:

### ✅ Core Features Implemented

1. **Dynamic Questionnaires**
   - Create questionnaires with custom title and description
   - Add/edit/remove fields dynamically
   - Support for 6 field types: text, textarea, select, date, time, datetime
   - Mark fields as required
   - Edit titles and descriptions anytime

2. **AI-Powered Field Extraction**
   - Claude AI integration for intelligent data extraction
   - Local pattern-based extraction (emails, phones, dates, names)
   - Hybrid approach: local extraction + AI fallback
   - Confidence scoring for extracted values
   - Smart field matching and type conversion

3. **Conversation Interface**
   - Voice input with speech-to-text
   - Text input with keyboard shortcuts
   - Real-time transcript preview
   - Conversation history tracking
   - Feedback messages for extraction results

4. **PDF Export**
   - Professional PDF generation
   - Customizable candidate and interviewer names
   - Beautiful formatting with gradients and styling
   - Automatic filename generation
   - Download directly to device

5. **PWA Features**
   - Installable as standalone app
   - Offline support with service worker
   - Local data storage with IndexedDB
   - Works on desktop, tablet, and mobile
   - Add to Home Screen support

6. **Enhanced UX**
   - Modern, responsive design
   - Smooth animations and transitions
   - Progress tracking for form completion
   - Error and success feedback
   - Mobile-optimized layout

## Project Structure

```
interview-pwa/
├── README.md                 # Main documentation
├── DEPLOYMENT.md            # Deployment guide
├── package.json             # Dependencies
├── vite.config.ts          # Build config
├── index.html              # HTML entry point
│
├── public/
│   ├── manifest.json       # PWA manifest
│   ├── sw.js               # Service worker
│
└── src/
    ├── App.tsx             # Main app component
    ├── App.css             # App styling
    ├── main.tsx            # Entry point
    ├── index.css           # Global styles
    │
    ├── components/
    │   ├── ConversationInput.tsx      # Voice/text input
    │   ├── QuestionnaireEditor.tsx    # Template editor
    │   ├── QuestionnaireRenderer.tsx  # Form renderer
    │   └── FieldComponents.tsx        # Field inputs
    │
    ├── services/
    │   ├── openaiExtractor.ts   # Claude AI integration
    │   ├── extractor.ts          # Local extraction logic
    │   ├── pdfExporter.ts        # PDF generation
    │   ├── voiceRecognition.ts   # Web Speech API
    │   └── indexedDB.ts          # Data persistence
    │
    ├── stores/
    │   └── appStore.ts           # Zustand state management
    │
    ├── types/
    │   └── index.ts              # TypeScript types
    │
    └── hooks/
        └── (custom hooks, if any)
```

## Getting Started - 5 Steps

### Step 1: Install Dependencies
```bash
cd interview-pwa
npm install
```

### Step 2: Start Development Server
```bash
npm run dev
```
Open your browser to `http://localhost:5173`

### Step 3: Create First Questionnaire
- Click "Create New Questionnaire"
- Enter title: "Interview Template"
- Add fields by clicking "Add Field"
- Example fields: Name, Email, Experience Level, Position Applied

### Step 4: Setup AI (Optional but Recommended)
- Click "Setup AI" on home screen
- Get API key from https://console.anthropic.com
- Paste key and click "Enable AI"
- Now you can use AI auto-fill

### Step 5: Test the App
- Create a questionnaire
- Fill it using voice or text
- Export to PDF
- Install as PWA

## How to Use Each Feature

### Creating a Questionnaire

1. Home Screen → "Create New Questionnaire"
2. Enter title and description
3. Click "Next: Fill Form"
4. Use Editor to add fields:
   
   **Text Field**: Simple single-line input
   - Best for: Names, emails, companies
   
   **Text Area**: Multi-line input
   - Best for: Comments, notes, descriptions
   
   **Dropdown**: Select from predefined options
   - Best for: Common responses (Role, Level, Status)
   - Format options as: `value|label` one per line
   
   **Date**: Date picker
   - Best for: Dates of birth, joining dates
   
   **Time**: Time picker
   - Best for: Appointment times
   
   **Date & Time**: Combined picker
   - Best for: Interview datetime stamps

5. Mark important fields as "Required"
6. Click "Next: Fill Form"

### Filling a Questionnaire

#### Using Voice Input
1. Say who you're talking to
2. Speak naturally: "The candidate's name is John Smith, they have 5 years of experience"
3. App automatically extracts and fills fields
4. Review and edit filled fields
5. Add more information as needed

#### Using Text Input
1. Type information: "Name: John Smith, Email: john@example.com"
2. Click "Submit" for local extraction
3. Click "AI Auto-fill" for intelligent extraction
4. Review extracted values
5. Manually edit any incorrect fields

#### Smart Extraction Rules
The app automatically recognizes:
- **Names**: "Name is John", "Call me John", "I'm John"
- **Emails**: any@email.com format
- **Phones**: (555) 123-4567, 555-123-4567
- **Dates**: MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD
- **Experience**: "5 years of experience", "10 yrs exp"
- **Dropdowns**: Matches option values from conversation

### Exporting to PDF

1. Complete questionnaire
2. Click "Export to PDF"
3. Enter details:
   - Candidate Name (affects filename)
   - Interviewer Name (appears in document)
4. Click "Download PDF"
5. PDF opens in browser, ready to save/print

### Installing as PWA

#### Windows/Chrome:
1. Click address bar menu (⋮)
2. Select "Install app"
3. Choose location
4. App appears in Start Menu

#### macOS/Safari:
1. Click Share → "Add to Dock"
2. Open from Applications

#### Mobile/Any Browser:
1. Click Share icon
2. Select "Add to Home Screen"
3. App appears on home screen

## API Integration

### Anthropic Claude API Setup

1. **Create Account**
   - Go to https://console.anthropic.com
   - Sign up for free account

2. **Generate API Key**
   - Navigate to API Keys section
   - Click "Create new key"
   - Copy the key

3. **Add to App**
   - Click "Setup AI" in app
   - Paste your key
   - Click "Enable AI"

4. **Security Notes**
   - Key is stored locally in your browser
   - Never stored on our servers
   - Only used for API calls from your device
   - Each user has their own key

## Tips & Best Practices

### For Best Results:
1. **Voice Input**: Speak in natural complete sentences
2. **Text Input**: Include field labels when typing: "Name: John"
3. **Field Order**: Put most important fields first
4. **Field Names**: Use clear, specific names
5. **Dropdowns**: Keep option values short

### Performance:
- Keep questionnaires under 20 fields
- Use voice input for faster data entry
- Export PDFs regularly to backup
- Clear old responses periodically

### Accuracy:
- Review AI extractions before export
- Manually fix any mismatches
- Provide context in conversation
- Use specific field labels in input

## Troubleshooting

### "AI Features Not Working"
- Check API key is valid at https://console.anthropic.com
- Verify internet connection
- Try refresh and re-enable AI
- Check browser console (F12) for errors

### "Voice Input Not Working"
- Check microphone permissions
- Use HTTPS (required for microphone)
- Try different browser
- Check if browser supports Web Speech API

### "PDF Export Failed"
- Try with fewer fields first
- Clear browser cache
- Restart browser
- Report error with details

### "Data Not Saving"
- Check if IndexedDB is enabled
- Clear browser cache
- Try incognito/private window
- Update browser to latest version

### "App Not Installing as PWA"
- Ensure HTTPS connection
- Clear browser data and reinstall
- Try different browser
- Check if already installed

## Building for Production

### Development Build
```bash
npm run build
```

### Production Deployment
See `DEPLOYMENT.md` for detailed instructions for:
- Vercel
- Netlify
- GitHub Pages
- Self-hosted servers
- Docker deployment

## Development Tips

### Adding New Field Types
1. Edit [types/index.ts](types/index.ts) - add to FieldType
2. Edit [components/FieldComponents.tsx](components/FieldComponents.tsx) - add component
3. Edit [components/QuestionnaireEditor.tsx](components/QuestionnaireEditor.tsx) - add option
4. Edit [services/extractor.ts](services/extractor.ts) - add extraction logic

### Customizing AI Behavior
1. Edit [services/openaiExtractor.ts](services/openaiExtractor.ts)
2. Modify the prompt to change extraction logic
3. Adjust confidence thresholds
4. Add new extraction patterns

### Styling Changes
1. Main CSS: [src/App.css](src/App.css)
2. Global CSS: [src/index.css](src/index.css)
3. Colors defined in CSS variables
4. Responsive breakpoints at 768px

## Keyboard Shortcuts

- `Ctrl+Enter` - Submit text in conversation
- `Tab` - Navigate between fields
- `Space` - Toggle checkboxes/select
- `Enter` - Activate buttons
- `Esc` - Close modals/dialogs

## Browser Compatibility

| Browser | Desktop | Mobile | PWA | Voice |
|---------|---------|--------|-----|-------|
| Chrome  | ✅      | ✅     | ✅  | ✅    |
| Edge    | ✅      | ✅     | ✅  | ✅    |
| Firefox | ✅      | ✅     | ⚠️  | ❌    |
| Safari  | ✅      | ✅     | ✅  | ⚠️    |
| Opera   | ✅      | ✅     | ✅  | ✅    |

✅ = Fully supported | ⚠️ = Partial support | ❌ = Not supported

## Support & Issues

### Getting Help
1. Check this guide first
2. Read DEPLOYMENT.md for deployment issues
3. Check browser console (F12) for technical errors
4. Review Anthropic API docs for AI issues

### Reporting Bugs
Include:
- Browser name and version
- What you were doing
- Error messages (if any)
- Screenshots/recordings

## Next Steps

1. ✅ Install dependencies
2. ✅ Run development server
3. ✅ Create test questionnaire
4. ✅ Get Anthropic API key
5. ✅ Test AI extraction
6. ✅ Try voice input
7. ✅ Export PDF
8. ✅ Install as PWA
9. ⏭️ Deploy to production (see DEPLOYMENT.md)

## Summary

Your Interview Data Collector is ready to use! It includes:

- ✅ Full CRUD for questionnaires and fields
- ✅ AI-powered intelligent field extraction
- ✅ Voice and text input processing
- ✅ Professional PDF generation
- ✅ Complete PWA with offline support
- ✅ Responsive, modern UI
- ✅ Zero server-side data storage
- ✅ Enterprise-ready features

Start by running `npm run dev` and creating your first questionnaire!

---

For detailed API integration and deployment information, see:
- [README.md](README.md) - Feature overview
- [DEPLOYMENT.md](DEPLOYMENT.md) - Production deployment guide

Happy collecting! 🎉
