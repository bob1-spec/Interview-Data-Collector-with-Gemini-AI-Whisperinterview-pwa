import React, { useState } from 'react';
import { useAppStore } from '../stores/appStore';
import { renderField } from './FieldComponents';
import { Download, Save } from 'lucide-react';
import { PdfExporter } from '../services/pdfExporter';

export const QuestionnaireRenderer: React.FC = () => {
  const { questionnaire, responses, updateResponse, setIsProcessing } = useAppStore();
  const [candidateName, setCandidateName] = useState('');
  const [interviewerName, setInterviewerName] = useState('');
  const [showExportSettings, setShowExportSettings] = useState(false);

  if (!questionnaire) {
    return <div className="alert">No questionnaire selected</div>;
  }

  const handleExportPDF = async () => {
    setIsProcessing(true);
    try {
      const filename = `${questionnaire.title.replace(/\s+/g, '_')}_${candidateName || 'candidate'}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      await PdfExporter.exportToPdf(questionnaire, responses, {
        filename,
        title: questionnaire.title,
        candidateName: candidateName || 'Candidate',
        interviewerName: interviewerName || 'Interviewer',
        date: new Date(),
      });
      
      alert('PDF downloaded successfully!');
      setShowExportSettings(false);
    } catch (error) {
      alert('PDF export failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsProcessing(false);
    }
  };

  const filledCount = Object.values(responses).filter((v) => v !== undefined && v !== '').length;
  const totalCount = questionnaire.fields.length;

  return (
    <div className="questionnaire-renderer">
      <div className="renderer-header">
        <h2>{questionnaire.title}</h2>
        {questionnaire.description && <p className="description">{questionnaire.description}</p>}
        <div className="progress-bar">
          <div className="progress" style={{ width: `${(filledCount / totalCount) * 100}%` }}></div>
          <span className="progress-text">{filledCount}/{totalCount} fields filled</span>
        </div>
      </div>

      <form className="questionnaire-form">
        {questionnaire.fields.map((field) => (
          <div key={field.id}>
            {renderField({
              field,
              value: responses[field.id],
              onChange: (value) => updateResponse(field.id, value),
            })}
          </div>
        ))}
      </form>

      <div className="renderer-actions">
        {!showExportSettings ? (
          <button
            onClick={() => setShowExportSettings(true)}
            className="btn btn-primary btn-large"
            disabled={filledCount === 0}
          >
            <Download size={20} />
            Export to PDF
          </button>
        ) : (
          <div className="export-settings-card">
            <h3>Export Settings</h3>
            <div className="form-group">
              <label className="form-label">
                Candidate Name:
              </label>
              <input
                type="text"
                placeholder="Enter candidate name"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Interviewer Name:
              </label>
              <input
                type="text"
                placeholder="Enter your name"
                value={interviewerName}
                onChange={(e) => setInterviewerName(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="button-group">
              <button
                onClick={handleExportPDF}
                className="btn btn-primary"
                disabled={filledCount === 0}
              >
                <Save size={18} />
                Download PDF
              </button>
              <button
                onClick={() => setShowExportSettings(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
