export interface TextAreaProps {
  name?: string;
  placeholder?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}

export function TextArea({
  name,
  placeholder,
  label,
  value,
  onChange,
  rows = 4,
}: TextAreaProps) {
  return (
    <label className="g-field">
      {label ? <span className="g-field__label">{label}</span> : null}
      <textarea
        className="g-textarea"
        name={name}
        placeholder={placeholder}
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

export default TextArea;
