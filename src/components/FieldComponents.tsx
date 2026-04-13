import React from 'react';
import type { Field } from '../types';

interface FieldInputProps {
  field: Field;
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
}

export const TextInput: React.FC<FieldInputProps> = ({
  field,
  value,
  onChange,
  disabled = false,
}) => (
  <div className="form-group">
    <label htmlFor={field.id}>
      {field.label}
      {field.required && <span className="required">*</span>}
    </label>
    {field.type === 'textarea' ? (
      <textarea
        id={field.id}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        disabled={disabled}
        className="form-input"
        rows={4}
      />
    ) : (
      <input
        id={field.id}
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        disabled={disabled}
        className="form-input"
      />
    )}
  </div>
);

export const DateInput: React.FC<FieldInputProps> = ({
  field,
  value,
  onChange,
  disabled = false,
}) => {
  const inputType = field.type === 'time' ? 'time' : field.type === 'datetime' ? 'datetime-local' : 'date';

  return (
    <div className="form-group">
      <label htmlFor={field.id}>
        {field.label}
        {field.required && <span className="required">*</span>}
      </label>
      <input
        id={field.id}
        type={inputType}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="form-input"
      />
    </div>
  );
};

export const SelectInput: React.FC<FieldInputProps> = ({
  field,
  value,
  onChange,
  disabled = false,
}) => (
  <div className="form-group">
    <label htmlFor={field.id}>
      {field.label}
      {field.required && <span className="required">*</span>}
    </label>
    <select
      id={field.id}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="form-input"
    >
      <option value="">-- Select an option --</option>
      {field.options?.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

export const renderField = (props: FieldInputProps) => {
  const { field } = props;

  switch (field.type) {
    case 'date':
    case 'time':
    case 'datetime':
      return <DateInput {...props} />;
    case 'select':
      return <SelectInput {...props} />;
    case 'text':
    case 'textarea':
      return <TextInput {...props} />;
    default:
      return <TextInput {...props} />;
  }
};
