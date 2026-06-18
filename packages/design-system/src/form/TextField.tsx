export interface TextFieldProps {
  name?: string;
  placeholder?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
}

export function TextField({
  name,
  placeholder,
  label,
  value,
  onChange,
}: TextFieldProps) {
  return (
    <label className="g-field">
      {label ? <span className="g-field__label">{label}</span> : null}
      <input
        className="g-input"
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

export default TextField;
