import React, { useState } from 'react';
import { useAppStore } from '../stores/appStore';
import type { Field, FieldType } from '../types';
import { Trash2, Plus, Edit2, Save } from 'lucide-react';

export const QuestionnaireEditor: React.FC = () => {
  const {
    questionnaire,
    setQuestionnaire,
    updateField,
    removeField,
    addField,
  } = useAppStore();

  const [showNewFieldForm, setShowNewFieldForm] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [tempTitle, setTempTitle] = useState('');
  const [tempDescription, setTempDescription] = useState('');
  const [newFieldData, setNewFieldData] = useState<Partial<Field>>({
    type: 'text',
    required: false,
  });

  if (!questionnaire) {
    return <div className="alert">No questionnaire selected</div>;
  }

  const handleAddField = () => {
    if (!newFieldData.label) {
      alert('Please enter a field label');
      return;
    }

    const field: Field = {
      id: Date.now().toString(),
      label: newFieldData.label,
      type: (newFieldData.type as FieldType) || 'text',
      required: newFieldData.required || false,
      options: newFieldData.options,
    };

    addField(field);
    setNewFieldData({ type: 'text', required: false });
    setShowNewFieldForm(false);
  };

  const handleSaveTitle = () => {
    setQuestionnaire({
      ...questionnaire,
      title: tempTitle || questionnaire.title,
      updatedAt: new Date(),
    });
    setEditingTitle(false);
  };

  const handleSaveDescription = () => {
    setQuestionnaire({
      ...questionnaire,
      description: tempDescription,
      updatedAt: new Date(),
    });
    setEditingDescription(false);
  };

  const handleStartEditTitle = () => {
    setTempTitle(questionnaire.title);
    setEditingTitle(true);
  };

  const handleStartEditDescription = () => {
    setTempDescription(questionnaire.description || '');
    setEditingDescription(true);
  };

  return (
    <div className="questionnaire-editor">
      <div className="editor-header">
        {editingTitle ? (
          <div className="title-edit-group">
            <input
              type="text"
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              className="form-input form-input-large"
            />
            <button
              onClick={handleSaveTitle}
              className="btn btn-primary btn-small"
            >
              <Save size={16} />
              Save
            </button>
            <button
              onClick={() => setEditingTitle(false)}
              className="btn btn-secondary btn-small"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="title-display-group">
            <h2>{questionnaire.title}</h2>
            <button
              onClick={handleStartEditTitle}
              className="btn btn-icon"
              title="Edit title"
            >
              <Edit2 size={16} />
            </button>
          </div>
        )}

        {editingDescription ? (
          <div className="description-edit-group">
            <textarea
              value={tempDescription}
              onChange={(e) => setTempDescription(e.target.value)}
              className="form-input"
              placeholder="Add a description..."
              rows={2}
            />
            <div className="button-group">
              <button
                onClick={handleSaveDescription}
                className="btn btn-primary btn-small"
              >
                <Save size={16} />
                Save
              </button>
              <button
                onClick={() => setEditingDescription(false)}
                className="btn btn-secondary btn-small"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="description-display-group">
            {questionnaire.description ? (
              <>
                <p>{questionnaire.description}</p>
                <button
                  onClick={handleStartEditDescription}
                  className="btn btn-icon btn-small"
                  title="Edit description"
                >
                  <Edit2 size={14} />
                </button>
              </>
            ) : (
              <button
                onClick={handleStartEditDescription}
                className="btn btn-secondary btn-small"
              >
                + Add Description
              </button>
            )}
          </div>
        )}
      </div>

      <div className="fields-list">
        {questionnaire.fields.length === 0 ? (
          <p className="empty-state">No fields yet. Add one to get started.</p>
        ) : (
          questionnaire.fields.map((field, index) => (
            <div key={field.id} className="field-editor-item">
              <div className="field-header">
                <span className="field-number">{index + 1}</span>
                <input
                  type="text"
                  value={field.label}
                  onChange={(e) => updateField(field.id, { label: e.target.value })}
                  className="field-label-input"
                />
                <button
                  onClick={() => removeField(field.id)}
                  className="btn-delete"
                  title="Delete field"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="field-config">
                <div className="config-group">
                  <label>
                    Type:
                    <select
                      value={field.type}
                      onChange={(e) =>
                        updateField(field.id, { type: e.target.value as FieldType })
                      }
                    >
                      <option value="text">Text</option>
                      <option value="textarea">Text Area</option>
                      <option value="select">Dropdown</option>
                      <option value="date">Date</option>
                      <option value="time">Time</option>
                      <option value="datetime">Date & Time</option>
                    </select>
                  </label>
                </div>

                <div className="config-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) => updateField(field.id, { required: e.target.checked })}
                    />
                    Required
                  </label>
                </div>

                {(field.type === 'textarea' || field.type === 'text') && (
                  <div className="config-group">
                    <input
                      type="text"
                      placeholder="Placeholder text"
                      value={field.placeholder || ''}
                      onChange={(e) =>
                        updateField(field.id, { placeholder: e.target.value })
                      }
                      className="form-input"
                    />
                  </div>
                )}

                {field.type === 'select' && (
                  <div className="config-group">
                    <label>Options (comma-separated):</label>
                    <textarea
                      value={
                        field.options?.map((o) => `${o.value}|${o.label}`).join('\n') || ''
                      }
                      onChange={(e) => {
                        const options = e.target.value
                          .split('\n')
                          .filter((line) => line.trim())
                          .map((line) => {
                            const [value, label] = line.split('|');
                            return { value: value.trim(), label: label?.trim() || value.trim() };
                          });
                        updateField(field.id, { options });
                      }}
                      className="form-input"
                      placeholder="value|label"
                      rows={3}
                    />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showNewFieldForm && (
        <div className="new-field-form">
          <h3>Add New Field</h3>
          <input
            type="text"
            placeholder="Field label"
            value={newFieldData.label || ''}
            onChange={(e) => setNewFieldData({ ...newFieldData, label: e.target.value })}
            className="form-input"
          />
          <select
            value={newFieldData.type || 'text'}
            onChange={(e) => setNewFieldData({ ...newFieldData, type: e.target.value as FieldType })}
            className="form-input"
          >
            <option value="text">Text</option>
            <option value="textarea">Text Area</option>
            <option value="select">Dropdown</option>
            <option value="date">Date</option>
            <option value="time">Time</option>
            <option value="datetime">Date & Time</option>
          </select>
          <label>
            <input
              type="checkbox"
              checked={newFieldData.required || false}
              onChange={(e) => setNewFieldData({ ...newFieldData, required: e.target.checked })}
            />
            Required
          </label>
          <button onClick={handleAddField} className="btn btn-primary">
            Add Field
          </button>
          <button onClick={() => setShowNewFieldForm(false)} className="btn btn-secondary">
            Cancel
          </button>
        </div>
      )}

      <button
        onClick={() => setShowNewFieldForm(!showNewFieldForm)}
        className="btn btn-primary btn-add-field"
      >
        <Plus size={20} /> Add Field
      </button>
    </div>
  );
};
