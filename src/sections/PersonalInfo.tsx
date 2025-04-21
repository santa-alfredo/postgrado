import React from 'react';
import type { FormData, FormErrors } from '../types/form';
import FormInput from '../components/FormInput';
import FormRadioGroup from '../components/FormRadioGroup';

interface PersonalInfoProps {
  formData: Partial<FormData>;
  updateFormData: (field: string, value: string) => void;
  errors: FormErrors;
}

const PersonalInfo: React.FC<PersonalInfoProps> = ({
  formData,
  updateFormData,
  errors,
}) => {
  const genderOptions = [
    { value: 'masculino', label: 'Masculino' },
    { value: 'femenino', label: 'Femenino' },
    { value: 'otro', label: 'Otro' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    updateFormData(name, value);
  };

  const handleGenderChange = (value: string) => {
    updateFormData('gender', value);
  };

  return (
    <div className="animate-fadeIn">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Datos informativos del estudiante</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
        <FormInput
          id="firstName"
          name="firstName"
          label="Nombres"
          value={formData.firstName || ''}
          onChange={handleChange}
          error={errors.firstName}
          placeholder="Ingrese sus nombres"
          required
        />
        
        <FormInput
          id="lastName"
          name="lastName"
          label="Apellidos"
          value={formData.lastName || ''}
          onChange={handleChange}
          error={errors.lastName}
          placeholder="Ingrese sus apellidos"
          required
        />
        
        <FormInput
          id="idNumber"
          name="idNumber"
          label="Número de identificación (cédula/pasaporte)"
          value={formData.idNumber || ''}
          onChange={handleChange}
          error={errors.idNumber}
          placeholder="Ingrese su número de identificación"
          required
        />
        
        <FormInput
          id="birthDate"
          name="birthDate"
          label="Fecha de nacimiento"
          type="date"
          value={formData.birthDate || ''}
          onChange={handleChange}
          error={errors.birthDate}
          required
        />
        
        <div className="md:col-span-2">
          <FormRadioGroup
            id="gender"
            label="Género"
            name="gender"
            value={formData.gender || ''}
            onChange={handleGenderChange}
            options={genderOptions}
            error={errors.gender}
          />
        </div>
        
        <div className="md:col-span-2">
          <FormInput
            id="address"
            name="address"
            label="Dirección de domicilio"
            value={formData.address || ''}
            onChange={handleChange}
            error={errors.address}
            placeholder="Ingrese su dirección de domicilio"
            required
          />
        </div>
        
        <FormInput
          id="phone"
          name="phone"
          label="Teléfono"
          type="tel"
          value={formData.phone || ''}
          onChange={handleChange}
          error={errors.phone}
          placeholder="Ingrese su número de teléfono"
          required
        />
        
        <FormInput
          id="email"
          name="email"
          label="Correo electrónico"
          type="email"
          value={formData.email || ''}
          onChange={handleChange}
          error={errors.email}
          placeholder="Ingrese su correo electrónico"
          required
        />
      </div>
    </div>
  );
};

export default PersonalInfo;