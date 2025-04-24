import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSpellcheck } from "../../hooks/useSpellcheck";
import Form from "../ficha/Form";
import Label from "../ficha/Label";
import Input from "../ficha/input/InputField";
import Select from "../ficha/Select";
import FileInput from "../ficha/input/FileInput";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
const API_BASE = import.meta.env.VITE_API_BASE;

// Datos de ejemplo - deberías reemplazarlos con tus datos reales
const locationData = {
  provincias: [
    { id: "1", nombre: "Pichincha" },
    { id: "2", nombre: "Guayas" },
    // Añade más provincias
  ],
  ciudades: [
    { id: "1", nombre: "Quito", provinciaId: "1" },
    { id: "2", nombre: "Guayaquil", provinciaId: "2" },
    { id: "3", nombre: "Sangolquí", provinciaId: "1" },
    // Añade más ciudades
  ],
  parroquias: [
    { id: "1", nombre: "La Magdalena", ciudadId: "1" },
    { id: "2", nombre: "El Condado", ciudadId: "1" },
    { id: "3", nombre: "Samborondón", ciudadId: "2" },
    { id: "4", nombre: "Santa Prisca", ciudadId: "1" },
    // Añade más parroquias
  ]
};


// Esquema de validación con Zod
const formSchema = z.object({
  // Información Personal
  nombres: z.string()
    .min(2, "Los nombres deben tener al menos 2 caracteres")
    .max(50, "Los nombres no pueden exceder 50 caracteres")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "Los nombres solo pueden contener letras y espacios"),
  // apellidos: z.string()
  //   .min(2, "Los apellidos deben tener al menos 2 caracteres")
  //   .max(50, "Los apellidos no pueden exceder 50 caracteres")
    // .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "Los apellidos solo pueden contener letras y espacios"),
  cedula: z.string()
    .min(10, "La cédula debe tener al menos 10 dígitos")
    .max(13, "La cédula no puede exceder 13 dígitos")
    .regex(/^\d+$/, "La cédula solo puede contener números"),
  fechaNacimiento: z.string()
    .min(1, "La fecha de nacimiento es requerida"),
  genero: z.string()
    .min(1, "El género es requerido"),
  estadoCivil: z.string()
    .min(1, "El estado civil es requerido"),
  telefono: z.string()
    .min(10, "El teléfono debe tener al menos 10 dígitos")
    .max(15, "El teléfono no puede exceder 15 dígitos")
    .regex(/^[\d\s()-]+$/, "El teléfono solo puede contener números, espacios, guiones y paréntesis"),
  email: z.string()
    .email("Debe ser un correo electrónico válido"),
  
  cambioResidencia: z.boolean().optional(),
  direccion: z.string()
    .min(10, "La dirección debe tener al menos 10 caracteres")
    .max(200, "La dirección no puede exceder 200 caracteres"),
  provinciaId: z.string()
    .min(1, "La provincia es requerida"),
  ciudadId: z.string()
    .min(1, "La ciudad es requerida"),
  parroquiaId: z.string()
    .min(1, "La parroquia es requerida"),

  // Información Académica
  carrera: z.string()
    .min(2, "La carrera debe tener al menos 2 caracteres")
    .max(100, "La carrera no puede exceder 100 caracteres"),
  colegio: z.string()
    .min(2, "El nombre del colegio debe tener al menos 2 caracteres")
    .max(100, "El nombre del colegio no puede exceder 100 caracteres"),
  tipoColegio: z.string()
    .min(1, "El tipo de colegio es requerido"),
  anioGraduacion: z.string()
    .min(4, "El año de graduación debe tener 4 dígitos")
    .max(4, "El año de graduación debe tener 4 dígitos")
    .regex(/^\d{4}$/, "El año de graduación debe ser un número de 4 dígitos")
    .transform((val) => parseInt(val, 10))
    .refine((val) => val >= 1990 && val <= new Date().getFullYear(), "El año de graduación debe estar entre 1990 y el año actual"),
  semestre: z.string()
    .min(1, "El semestre es requerido")
    .regex(/^\d+$/, "El semestre debe ser un número"),
  promedio: z.string()
    .min(1, "El promedio es requerido")
    .regex(/^\d+(\.\d{1,2})?$/, "El promedio debe ser un número con máximo 2 decimales")
    .transform((val) => parseFloat(val))
    .refine((val) => val >= 0 && val <= 10, "El promedio debe estar entre 0 y 10"),
  estudioOtraUniversidad: z.boolean().optional(),
  otraUniversidad: z.object({
    nombre: z.string()
      .min(2, "La universidad debe tener al menos 2 caracteres")
      .max(100, "La universidad no puede exceder 100 caracteres"),
    carrera: z.string()
      .min(2, "La carrera debe tener al menos 2 caracteres")
      .max(100, "La carrera no puede exceder 100 caracteres"),
  }).optional(),
  
  beca: z.boolean().optional(),
  
  // Información Económica
  ingresosFamiliares: z.string()
    .min(1, "Los ingresos familiares son requeridos")
    .regex(/^\d+(\.\d{1,2})?$/, "Los ingresos deben ser un número con máximo 2 decimales"),
  gastosMensuales: z.string()
    .min(1, "Los gastos mensuales son requeridos")
    .regex(/^\d+(\.\d{1,2})?$/, "Los gastos deben ser un número con máximo 2 decimales"),
  vivienda: z.string()
    .min(1, "Los gastos en vivienda son requeridos")
    .regex(/^\d+(\.\d{1,2})?$/, "Los gastos deben ser un número con máximo 2 decimales"),
  transporte: z.string()
    .min(1, "Los gastos en transporte son requeridos")
    .regex(/^\d+(\.\d{1,2})?$/, "Los gastos deben ser un número con máximo 2 decimales"),
  alimentacion: z.string()
    .min(1, "Los gastos en alimentación son requeridos")
    .regex(/^\d+(\.\d{1,2})?$/, "Los gastos deben ser un número con máximo 2 decimales"),
  otrosGastos: z.string()
    .min(1, "Los otros gastos son requeridos")
    .regex(/^\d+(\.\d{1,2})?$/, "Los gastos deben ser un número con máximo 2 decimales"),
  
  // Documentos
  // documentos: z.instanceof(FileList)
  //   .refine((files) => files.length > 0, "Debe subir al menos un documento")
})

type FormData = z.infer<typeof formSchema>;

interface Ubicacion {
  id: string;
  nombre: string;
  provinciaId?: string;
  ciudadId?: string;
}

export default function FormSocioeconomico() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control
  } = useForm<FormData>({
    resolver: zodResolver(formSchema)
  });

  const { suggestions, checkSpelling } = useSpellcheck();

  const estudioOtraUniversidad = useWatch({ control, name: "estudioOtraUniversidad" });

  const { user } = useAuth(); // Obtener el usuario del contexto
  const onSubmit = async (data: FormData) => {
    console.log(data);
    // Aquí se enviaría la información al backend
    try {
      const response = await fetch(`${API_BASE}/ficha/ficha-socioeconomica`, {
        method: "POST",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...data, cllc_cdg: user?.name || "" }),
      });
  
      if (!response.ok) {
        throw new Error("Error en la solicitud");
      }
  
      const result = await response.json();
      console.log("Respuesta del servidor:", result);
      // aquí puedes mostrar una notificación de éxito o redirigir
  
    } catch (error) {
      console.error("Error al enviar la ficha socioeconómica:", error);
      // mostrar error al usuario si deseas
    }
  };
  const onError = (errors: any) => {
    console.log(errors);
  };

  // Estado para las opciones filtradas
  const [ciudadesFiltradas, setCiudadesFiltradas] = useState<Ubicacion[]>([]);
  const [parroquiasFiltradas, setParroquiasFiltradas] = useState<Ubicacion[]>([]);

  // Función para manejar el cambio de provincia
  const handleProvinciaChange = (e) => {
    const provinciaId = e.target.value;
    
    // Actualizar el valor de provinciaId en el formulario
    setValue("provinciaId", provinciaId);
    
    // Filtrar ciudades basado en la provincia seleccionada
    if (provinciaId) {
      const ciudades = locationData.ciudades.filter(
        ciudad => ciudad.provinciaId === provinciaId
      );
      setCiudadesFiltradas(ciudades);
    } else {
      setCiudadesFiltradas([]);
    }
    
    // Resetear ciudad y parroquia
    setValue("ciudadId", "");
    setValue("parroquiaId", "");
    setParroquiasFiltradas([]);
  };

  // Función para manejar el cambio de ciudad
  const handleCiudadChange = (e) => {
    const ciudadId = e.target.value;
    
    // Actualizar el valor de ciudadId en el formulario
    setValue("ciudadId", ciudadId);
    
    // Filtrar parroquias basado en la ciudad seleccionada
    if (ciudadId) {
      const parroquias = locationData.parroquias.filter(
        parroquia => parroquia.ciudadId === ciudadId
      );
      setParroquiasFiltradas(parroquias);
    } else {
      setParroquiasFiltradas([]);
    }
    
    // Resetear parroquia
    setValue("parroquiaId", "");
  };
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.name) return;
  
      try {
        const response = await fetch(`${API_BASE}/cliente/${user.name}`, {
          credentials: 'include',
        });
        if (!response.ok) throw new Error("Error al obtener datos del usuario");
  
        const userData = await response.json();
        // Rellenar los valores del formulario
        setValue("nombres", userData.data.cllc_nmb);
        setValue("cedula", userData.data.cllc_ruc);
        setValue("telefono", userData.data.cllc_celular);
        setValue("email", userData.data.cllc_email);
      } catch (error) {
        console.error("Error cargando datos del usuario:", error);
      }
    };
  
    fetchUserData();
  }, [user]);
  
  return (
    <Form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-8">
      {/* Sección 1: Información Personal */}
      <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-800">
        <h3 className="mb-4 text-lg font-semibold">Información Personal</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <Label>Nombres <span className="text-error-500">*</span></Label>
            <Input
              register={register("nombres")}
              readOnly={true}
              error={!!errors.nombres || !!suggestions}
              hint={errors.nombres?.message}
              errorSuggestions={suggestions}
            />
          </div>
          <div>
            <Label>Cédula <span className="text-error-500">*</span></Label>
            <Input
              register={register("cedula")}
              readOnly={true}
              error={!!errors.cedula}
              hint={errors.cedula?.message}
            />
          </div>
          <div>
            <Label>Fecha de Nacimiento <span className="text-error-500">*</span></Label>
            <Input
              type="date"
              register={register("fechaNacimiento")}
              error={!!errors.fechaNacimiento}
              hint={errors.fechaNacimiento?.message}
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
              onChange={(value) => setValue("genero", value)}
              placeholder="Seleccione su género"
            />
            {errors.genero && (
              <p className="mt-1 text-sm text-error-500">{errors.genero.message}</p>
            )}
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
              onChange={(value) => setValue("estadoCivil", value)}
              placeholder="Seleccione su estado civil"
            />
            {errors.estadoCivil && (
              <p className="mt-1 text-sm text-error-500">{errors.estadoCivil.message}</p>
            )}
          </div>
          <div>
            <Label>Celular <span className="text-error-500">*</span></Label>
            <Input
              type="tel"
              register={register("telefono")}
              error={!!errors.telefono}
              hint={errors.telefono?.message}
            />
          </div>
          <div>
            <Label>Correo Electrónico <span className="text-error-500">*</span></Label>
            <Input
              type="email"
              register={register("email")}
              error={!!errors.email}
              hint={errors.email?.message}
            />
          </div>
        </div>
      </div>

      {/* Sección 2: Información Académica */}
      <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-800">
        <h3 className="mb-4 text-lg font-semibold">Información Académica</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <Label>Colegio <span className="text-error-500">*</span></Label>
            <Input
              register={register("colegio")}
              error={!!errors.colegio}
              hint={errors.colegio?.message}
            />
          </div>
          <div>
            <Label>Tipo de Colegio <span className="text-error-500">*</span></Label>
            <Select
              options={[
                { value: "publico", label: "Público" },
                { value: "privado", label: "Privado" }
              ]}
              onChange={(value) => setValue("tipoColegio", value)}
              placeholder="Seleccione el tipo de colegio"
            />
            {errors.tipoColegio && (
              <p className="mt-1 text-sm text-error-500">{errors.tipoColegio.message}</p>
            )}
          </div>

          <div>
            <Label>Año de Graduación <span className="text-error-500">*</span></Label>
            <Input
              type="number"
              register={register("anioGraduacion")}
              error={!!errors.anioGraduacion}
              hint={errors.anioGraduacion?.message}
            />
          </div>
          <div>
            <Label>Promedio de Grado <span className="text-error-500">*</span></Label>
            <Input
              type="number"
              step={0.01}
              register={register("promedio")}
              error={!!errors.promedio}
              hint={errors.promedio?.message}
            />
          </div>
          {/* Universidad UMET */}
          <div className="col-span-1 sm:col-span-2">
            <h3 className="text-lg font-semibold">Universidad UMET</h3>
          </div>
          <div>
            <Label>Carrera <span className="text-error-500">*</span></Label>
            <Input
              register={register("carrera")}
              error={!!errors.carrera}
              hint={errors.carrera?.message}
            />
          </div>
          <div>
            <Label>Semestre <span className="text-error-500">*</span></Label>
            <Input
              type="number"
              register={register("semestre")}
              error={!!errors.semestre}
              hint={errors.semestre?.message}
            />
          </div>
          <div>
            <Label>Es Becado? <span className="text-error-500">*</span></Label>
            <input type="checkbox" {...register("beca")} />
          </div>

          {/* ¿Estudio en otra Universidad? */}
          <div className="col-span-1 sm:col-span-2">
            <label htmlFor="estudioOtraUniversidad" className="text-lg font-semibold">
              ¿Estudio en otra Universidad? 
              <input type="checkbox" id="estudioOtraUniversidad" {...register("estudioOtraUniversidad")} />
            </label>
          </div>
          {estudioOtraUniversidad && (
          <div className="col-span-1 sm:col-span-2">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <Label>Nombre de la universidad <span className="text-error-500">*</span></Label>
                <Input
                  register={register("otraUniversidad.nombre")}
                  error={!!errors.otraUniversidad?.nombre}
                  hint={errors.otraUniversidad?.nombre?.message}
                />
              </div>
              <div>
                <Label>Carrera de la universidad <span className="text-error-500">*</span></Label>
                <Input
                  register={register("otraUniversidad.carrera")}
                  error={!!errors.otraUniversidad?.carrera}
                  hint={errors.otraUniversidad?.carrera?.message}
                />
              </div>
            </div>
          </div>
          )}
        </div>
      </div>
      {/* Sección 3: Información residencia */}
      <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-800">
        <h3 className="mb-4 text-lg font-semibold">Información Residencia</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <Label>Dirección <span className="text-error-500">*</span></Label>
            <Input
              register={register("direccion")}
              error={!!errors.direccion}
              hint={errors.direccion?.message}
            />
          </div>
          <div>
            <Label>Tuvo que cambiar de residencia para estudiar? <span className="text-error-500">*</span></Label>
            <input type="checkbox" {...register("cambioResidencia")} />
          </div>
          
          {/* Select Provincia */}
          <div>
            <Label>Provincia <span className="text-error-500">*</span></Label>
            <select
              className={`w-full rounded-md border px-3 py-2 ${errors.provinciaId ? 'border-red-500' : 'border-gray-300'}`}
              {...register("provinciaId")}
              onChange={handleProvinciaChange}
            >
              <option value="">Seleccione una provincia</option>
              {locationData.provincias.map((provincia) => (
                <option key={provincia.id} value={provincia.id}>
                  {provincia.nombre}
                </option>
              ))}
            </select>
            {errors.provinciaId && (
              <p className="mt-1 text-sm text-red-500">{errors.provinciaId.message}</p>
            )}
          </div>
          
          {/* Select Ciudad */}
          <div>
            <Label>Ciudad <span className="text-error-500">*</span></Label>
            <select
              className={`w-full rounded-md border px-3 py-2 ${errors.ciudadId ? 'border-red-500' : 'border-gray-300'}`}
              {...register("ciudadId")}
              onChange={handleCiudadChange}
              disabled={!ciudadesFiltradas.length}
            >
              <option value="">Seleccione una ciudad</option>
              {ciudadesFiltradas.map((ciudad: any) => (
                <option key={ciudad.id} value={ciudad.id}>
                  {ciudad.nombre}
                </option>
              ))}
            </select>
            {errors.ciudadId && (
              <p className="mt-1 text-sm text-red-500">{errors.ciudadId.message}</p>
            )}
          </div>
          
          {/* Select Parroquia */}
          <div>
            <Label>Parroquia <span className="text-error-500">*</span></Label>
            <select
              className={`w-full rounded-md border px-3 py-2 ${errors.parroquiaId ? 'border-red-500' : 'border-gray-300'}`}
              {...register("parroquiaId")}
              disabled={!parroquiasFiltradas.length}
            >
              <option value="">Seleccione una parroquia</option>
              {parroquiasFiltradas.map((parroquia: any) => (
                <option key={parroquia.id} value={parroquia.id}>
                  {parroquia.nombre}
                </option>
              ))}
            </select>
            {errors.parroquiaId && (
              <p className="mt-1 text-sm text-red-500">{errors.parroquiaId.message}</p>
            )}
          </div>


        </div>
      </div>
      {/* Sección 4: Información Económica */}
      <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-800">
        <h3 className="mb-4 text-lg font-semibold">Información Económica</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <Label>Ingresos Familiares Mensuales <span className="text-error-500">*</span></Label>
            <Input
              type="number"
              step={0.01}
              register={register("ingresosFamiliares")}
              error={!!errors.ingresosFamiliares}
              hint={errors.ingresosFamiliares?.message}
            />
          </div>
          <div>
            <Label>Gastos Mensuales <span className="text-error-500">*</span></Label>
            <Input
              type="number"
              step={0.01}
              register={register("gastosMensuales")}
              error={!!errors.gastosMensuales}
              hint={errors.gastosMensuales?.message}
            />
          </div>
          <div>
            <Label>Gastos en Vivienda <span className="text-error-500">*</span></Label>
            <Input
              type="number"
              step={0.01}
              register={register("vivienda")}
              error={!!errors.vivienda}
              hint={errors.vivienda?.message}
            />
          </div>
          <div>
            <Label>Gastos en Transporte <span className="text-error-500">*</span></Label>
            <Input
              type="number"
              step={0.01}
              register={register("transporte")}
              error={!!errors.transporte}
              hint={errors.transporte?.message}
            />
          </div>
          <div>
            <Label>Gastos en Alimentación <span className="text-error-500">*</span></Label>
            <Input
              type="number"
              step={0.01}
              register={register("alimentacion")}
              error={!!errors.alimentacion}
              hint={errors.alimentacion?.message}
            />
          </div>
          <div>
            <Label>Otros Gastos <span className="text-error-500">*</span></Label>
            <Input
              type="number"
              step={0.01}
              register={register("otrosGastos")}
              error={!!errors.otrosGastos}
              hint={errors.otrosGastos?.message}
            />
          </div>
        </div>
      </div>
      {/* Sección 5: Información Laboral */}
      <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-800">
        <h3 className="mb-4 text-lg font-semibold">Información Laboral</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <Label>Empresa <span className="text-error-500">*</span></Label>  
            <Input
              register={register("empresa")}
              error={!!errors.empresa}
              hint={errors.empresa?.message}
            />
          </div>
          <div>
            <Label>Cargo <span className="text-error-500">*</span></Label>
            <Input
              register={register("cargo")}
              error={!!errors.cargo}
              hint={errors.cargo?.message}
            />
          </div>
        </div>
      </div>
      

      {/* Sección 4: Documentos */}
      {/* <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-800">
        <h3 className="mb-4 text-lg font-semibold">Documentos Requeridos</h3>
        <div>
          <Label>Documentos de Soporte <span className="text-error-500">*</span></Label>
          <FileInput
            {...register("documentos")}
            multiple
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          />
          {errors.documentos && (
            <p className="mt-1 text-sm text-error-500">{errors.documentos.message}</p>
          )}
          <p className="mt-2 text-sm text-gray-500">
            Sube los siguientes documentos: Cédula, Certificado de ingresos, Certificado de matrícula, Otros documentos de soporte
          </p>
        </div>
      </div> */}

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