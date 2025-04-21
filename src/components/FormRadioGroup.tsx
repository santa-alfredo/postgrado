import Label from './ficha/Label';
import Radio from './ficha/input/Radio';

interface FormRadioGroupProps {
  id: string;
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  error?: string;
}

export default function FormRadioGroup({
  id,
  label,
  name,
  value,
  onChange,
  options,
  error
}: FormRadioGroupProps) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="space-y-2">
        {options.map((option) => (
          <Radio
            key={option.value}
            id={`${id}-${option.value}`}
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            label={option.label}
          />
        ))}
      </div>
      {error && <div className="mt-1 text-sm text-red-500">{error}</div>}
    </div>
  );
} 