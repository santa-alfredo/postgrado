import React from 'react';
import Label from './ficha/Label';
import Select from './ficha/input/Select';

interface FormSelectProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  error?: string;
}

export default function FormSelect({
  label,
  name,
  value,
  onChange,
  options,
  error
}: FormSelectProps) {
  return (
    <div>
      <Label>{label}</Label>
      <Select
        name={name}
        value={value}
        onChange={onChange}
        options={options}
      />
      {error && <div className="mt-1 text-sm text-red-500">{error}</div>}
    </div>
  );
} 