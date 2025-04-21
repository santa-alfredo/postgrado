import React from 'react';
import Input from './ficha/input/InputField';
import Label from './ficha/Label';

interface FormInputProps {
  id: string;
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}

export default function FormInput({
  id,
  label,
  name,
  value,
  onChange,
  error,
  type = 'text',
  placeholder,
  required = false
}: FormInputProps) {
  return (
    <div>
      <Label>{label}</Label>
      <Input
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        type={type}
        placeholder={placeholder}
        required={required}
      />
      {error && <div className="mt-1 text-sm text-red-500">{error}</div>}
    </div>
  );
} 