import { useState } from "react";
import Label from "../../ficha/Label";
import Input from "../../ficha/input/InputField";
import Checkbox from "../../ficha/input/Checkbox";
import Select from "../../ficha/input/Select";

export default function InformacionAcademica() {
  const [formData, setFormData] = useState({
    colegio: "",
    anioGraduacion: "",
    tipoColegio: "",
    tituloBachiller: "",
    promedioSecundaria: "",
    estudioOtraUniversidad: false,
    universidadAnterior: "",
    carreraAnterior: "",
    carreraActual: "",
    semestreActual: "",
    tieneBeca: false,
    institucionBeca: "",
    cambioResidencia: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
        Información Académica
      </h2>

      {/* Educación Secundaria */}
      <div className="space-y-4">
        <h3 className="text-md font-medium text-gray-700 dark:text-gray-300">
          Educación Secundaria
        </h3>
        
        <div>
          <Label>Nombre del Colegio <span className="text-error-500">*</span></Label>
          <Input 
            name="colegio"
            value={formData.colegio}
            onChange={handleInputChange}
            placeholder="Nombre del colegio donde se graduó" 
          />
        </div>

        <div>
          <Label>Año de Graduación <span className="text-error-500">*</span></Label>
          <Input 
            name="anioGraduacion"
            value={formData.anioGraduacion}
            onChange={handleInputChange}
            type="text"
            placeholder="Ej: 2020" 
          />
        </div>

        <div>
          <Label>Tipo de Colegio <span className="text-error-500">*</span></Label>
          <Select
            name="tipoColegio"
            value={formData.tipoColegio}
            onChange={handleInputChange}
            options={[
              { value: "", label: "Seleccione una opción" },
              { value: "publico", label: "Público" },
              { value: "privado", label: "Privado" }
            ]}
          />
        </div>

        <div>
          <Label>Título de Bachiller <span className="text-error-500">*</span></Label>
          <Input 
            name="tituloBachiller"
            value={formData.tituloBachiller}
            onChange={handleInputChange}
            placeholder="Ej: Bachiller en Ciencias" 
          />
        </div>

        <div>
          <Label>Promedio en la Secundaria <span className="text-error-500">*</span></Label>
          <Input 
            name="promedioSecundaria"
            value={formData.promedioSecundaria}
            onChange={handleInputChange}
            type="text"
            placeholder="Ej: 8.5" 
          />
        </div>
      </div>

      {/* Educación Universitaria Anterior */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Checkbox 
            checked={formData.estudioOtraUniversidad} 
            onChange={(checked) => handleCheckboxChange("estudioOtraUniversidad", checked)} 
          />
          <Label>¿Estudió en otra universidad?</Label>
        </div>

        {formData.estudioOtraUniversidad && (
          <>
            <div>
              <Label>Nombre de la Universidad</Label>
              <Input 
                name="universidadAnterior"
                value={formData.universidadAnterior}
                onChange={handleInputChange}
                placeholder="Nombre de la universidad anterior" 
              />
            </div>

            <div>
              <Label>Carrera que seguía</Label>
              <Input 
                name="carreraAnterior"
                value={formData.carreraAnterior}
                onChange={handleInputChange}
                placeholder="Nombre de la carrera" 
              />
            </div>
          </>
        )}
      </div>

      {/* Información Actual en UMET */}
      <div className="space-y-4">
        <h3 className="text-md font-medium text-gray-700 dark:text-gray-300">
          Información Actual en UMET
        </h3>

        <div>
          <Label>Carrera que sigue <span className="text-error-500">*</span></Label>
          <Select
            name="carreraActual"
            value={formData.carreraActual}
            onChange={handleInputChange}
            options={[
              { value: "", label: "Seleccione una carrera" },
              { value: "ingenieria", label: "Ingeniería en Sistemas" },
              { value: "administracion", label: "Administración de Empresas" },
              { value: "contabilidad", label: "Contabilidad" }
            ]}
          />
        </div>

        <div>
          <Label>Semestre Actual <span className="text-error-500">*</span></Label>
          <Select
            name="semestreActual"
            value={formData.semestreActual}
            onChange={handleInputChange}
            options={[
              { value: "", label: "Seleccione el semestre" },
              ...Array.from({ length: 10 }, (_, i) => ({
                value: (i + 1).toString(),
                label: `${i + 1}° Semestre`
              }))
            ]}
          />
        </div>

        <div className="flex items-center gap-3">
          <Checkbox 
            checked={formData.tieneBeca} 
            onChange={(checked) => handleCheckboxChange("tieneBeca", checked)} 
          />
          <Label>¿Cuenta con beca?</Label>
        </div>

        {formData.tieneBeca && (
          <div>
            <Label>Institución que ofrece la beca</Label>
            <Input 
              name="institucionBeca"
              value={formData.institucionBeca}
              onChange={handleInputChange}
              placeholder="Nombre de la institución" 
            />
          </div>
        )}

        <div className="flex items-center gap-3">
          <Checkbox 
            checked={formData.cambioResidencia} 
            onChange={(checked) => handleCheckboxChange("cambioResidencia", checked)} 
          />
          <Label>¿Tuvo que cambiar de residencia para estudiar en UMET?</Label>
        </div>
      </div>
    </div>
  );
} 