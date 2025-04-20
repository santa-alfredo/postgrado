import { useState } from "react";
import Form from "../ficha/Form";
import Label from "../ficha/Label";
import Input from "../ficha/input/InputField";
import Select from "../ficha/Select";
import FileInput from "../ficha/input/FileInput";
import { EyeCloseIcon, EyeIcon } from "../../icons";

interface FormData {
  // Información Personal
  nombres: string;
  apellidos: string;
  cedula: string;
  fechaNacimiento: string;
  genero: string;
  estadoCivil: string;
  telefono: string;
  email: string;
  direccion: string;
  
  // Información Académica
  carrera: string;
  semestre: string;
  promedio: string;
  universidad: string;
  
  // Información Familiar
  miembrosFamilia: Array<{
    nombre: string;
    parentesco: string;
    edad: string;
    ocupacion: string;
    ingresos: string;
  }>;
  
  // Información Económica
  ingresosFamiliares: string;
  gastosMensuales: string;
  vivienda: string;
  transporte: string;
  alimentacion: string;
  otrosGastos: string;
  
  // Documentos
  documentos: File[];
}

export default function FormSocioeconomico() {
  const [formData, setFormData] = useState<FormData>({
    nombres: "",
    apellidos: "",
    cedula: "",
    fechaNacimiento: "",
    genero: "",
    estadoCivil: "",
    telefono: "",
    email: "",
    direccion: "",
    carrera: "",
    semestre: "",
    promedio: "",
    universidad: "",
    miembrosFamilia: [],
    ingresosFamiliares: "",
    gastosMensuales: "",
    vivienda: "",
    transporte: "",
    alimentacion: "",
    otrosGastos: "",
    documentos: []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí se enviaría la información al backend
    console.log(formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string) => (value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({
        ...prev,
        documentos: Array.from(e.target.files as FileList)
      }));
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="space-y-8">
      {/* Sección 1: Información Personal */}
      <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-800">
        <h3 className="mb-4 text-lg font-semibold">Información Personal</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <Label>Nombres <span className="text-error-500">*</span></Label>
            <Input
              name="nombres"
              value={formData.nombres}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label>Apellidos <span className="text-error-500">*</span></Label>
            <Input
              name="apellidos"
              value={formData.apellidos}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label>Cédula <span className="text-error-500">*</span></Label>
            <Input
              name="cedula"
              value={formData.cedula}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label>Fecha de Nacimiento <span className="text-error-500">*</span></Label>
            <Input
              type="date"
              name="fechaNacimiento"
              value={formData.fechaNacimiento}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label>Género <span className="text-error-500">*</span></Label>
            <Select
              options={[
                { value: "masculino", label: "Masculino" },
                { value: "femenino", label: "Femenino" },
                { value: "otro", label: "Otro" }
              ]}
              onChange={handleSelectChange("genero")}
              placeholder="Seleccione su género"
            />
          </div>
          <div>
            <Label>Estado Civil <span className="text-error-500">*</span></Label>
            <Select
              options={[
                { value: "soltero", label: "Soltero/a" },
                { value: "casado", label: "Casado/a" },
                { value: "divorciado", label: "Divorciado/a" },
                { value: "viudo", label: "Viudo/a" }
              ]}
              onChange={handleSelectChange("estadoCivil")}
              placeholder="Seleccione su estado civil"
            />
          </div>
        </div>
      </div>

      {/* Sección 2: Información Académica */}
      <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-800">
        <h3 className="mb-4 text-lg font-semibold">Información Académica</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <Label>Carrera <span className="text-error-500">*</span></Label>
            <Input
              name="carrera"
              value={formData.carrera}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label>Semestre <span className="text-error-500">*</span></Label>
            <Input
              name="semestre"
              value={formData.semestre}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label>Promedio <span className="text-error-500">*</span></Label>
            <Input
              type="number"
              name="promedio"
              value={formData.promedio}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label>Universidad <span className="text-error-500">*</span></Label>
            <Input
              name="universidad"
              value={formData.universidad}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </div>

      {/* Sección 3: Información Económica */}
      <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-800">
        <h3 className="mb-4 text-lg font-semibold">Información Económica</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <Label>Ingresos Familiares Mensuales <span className="text-error-500">*</span></Label>
            <Input
              type="number"
              name="ingresosFamiliares"
              value={formData.ingresosFamiliares}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label>Gastos Mensuales <span className="text-error-500">*</span></Label>
            <Input
              type="number"
              name="gastosMensuales"
              value={formData.gastosMensuales}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label>Gastos en Vivienda <span className="text-error-500">*</span></Label>
            <Input
              type="number"
              name="vivienda"
              value={formData.vivienda}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label>Gastos en Transporte <span className="text-error-500">*</span></Label>
            <Input
              type="number"
              name="transporte"
              value={formData.transporte}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label>Gastos en Alimentación <span className="text-error-500">*</span></Label>
            <Input
              type="number"
              name="alimentacion"
              value={formData.alimentacion}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label>Otros Gastos <span className="text-error-500">*</span></Label>
            <Input
              type="number"
              name="otrosGastos"
              value={formData.otrosGastos}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </div>

      {/* Sección 4: Documentos */}
      <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-800">
        <h3 className="mb-4 text-lg font-semibold">Documentos Requeridos</h3>
        <div>
          <Label>Documentos de Soporte <span className="text-error-500">*</span></Label>
          <FileInput
            onChange={handleFileChange}
            multiple
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          />
          <p className="mt-2 text-sm text-gray-500">
            Sube los siguientes documentos: Cédula, Certificado de ingresos, Certificado de matrícula, Otros documentos de soporte
          </p>
        </div>
      </div>

      {/* Botón de Envío */}
      <div className="flex justify-end">
        <button
          type="submit"
          className="rounded-lg bg-brand-500 px-6 py-3 text-sm font-medium text-white hover:bg-brand-600"
        >
          Enviar Solicitud
        </button>
      </div>
    </Form>
  );
} 