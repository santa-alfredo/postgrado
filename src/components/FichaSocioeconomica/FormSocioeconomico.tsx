import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSpellcheck } from "../../hooks/useSpellcheck";
import Form from "../ficha/Form";
import Label from "../ficha/Label";
import Input from "../ficha/input/InputField";
import Select from "../ficha/Select";
import { useEffect, useState } from "react";
import axiosInstance from "../../services/axiosInstance";


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
    .regex(/^\d{10}$/, "El teléfono debe tener exactamente 10 dígitos numéricos"),
  email: z.string()
    .email("Debe ser un correo electrónico válido"),
  nacionalidad: z.string()
    .min(1, "La nacionalidad es requerida"),
  etnia: z.enum(["mestizo", "indigena", "blanco", "afroecuatoriano", "montubio", "mulato", "negro", "otro", "ninguno"], { required_error: "La etnia es requerida" }),
  indigenaNacionalidad: z.number(),

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
  anioGraduacion: z.number().int().min(1900, 'Año inválido').max(2025, 'Año inválido'),
  semestre: z.string()
    .min(1, "El semestre es requerido")
    .regex(/^\d+$/, "El semestre debe ser un número"),
  promedio: z.number().min(0).max(10),
  estudioOtraUniversidad: z.boolean(),
  otraUniversidad: z.object({
    nombre: z.string()
      .min(2, "La universidad debe tener al menos 2 caracteres")
      .max(100, "La universidad no puede exceder 100 caracteres"),
    carrera: z.string()
      .min(2, "La carrera debe tener al menos 2 caracteres")
      .max(100, "La carrera no puede exceder 100 caracteres"),
    razon: z.string()
      .min(2, "La razón debe tener al menos 2 caracteres")
      .max(100, "La razón no puede exceder 100 caracteres"),
  }).optional(),

  beca: z.boolean().optional(),
  internet: z.boolean().optional(),
  computadora: z.boolean().optional(),

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

  // Información Laboral
  situacionLaboral: z.enum(["empleado", "desempleado", "negocio propio", "pensionado", "otro"], { required_error: "La situación laboral es requerida" }),
  laboral: z.discriminatedUnion("tipo",
    [
      z.object({
        tipo: z.literal("empleado"),
        empresa: z.string()
          .min(2, "La empresa debe tener al menos 2 caracteres")
          .max(100, "La empresa no puede exceder 100 caracteres"),
        cargo: z.string()
          .min(2, "El cargo debe tener al menos 2 caracteres")
          .max(100, "El cargo no puede exceder 100 caracteres"),
        sueldo: z.number()
          .min(0, "El sueldo no puede ser negativo")
          .max(1000000, "El sueldo no puede exceder 1000000"),
      }),
      z.object({
        tipo: z.literal("negocio propio"),
        negocio: z.string()
          .min(2, "El negocio debe tener al menos 2 caracteres")
          .max(100, "El negocio no puede exceder 100 caracteres"),
        ingresos: z.number()
          .min(0, "Los ingresos no pueden ser negativos")
          .max(1000000, "Los ingresos no pueden exceder 1000000"),
        gastos: z.number()
          .min(0, "Los gastos no pueden ser negativos")
          .max(1000000, "Los gastos no pueden exceder 1000000"),
        actividades: z.string()
          .min(2, "Las actividades deben tener al menos 2 caracteres")
          .max(100, "Las actividades no pueden exceder 100 caracteres"),
      }),
      z.object({
        tipo: z.literal('pensionado'),
        fuente: z
          .string()
          .min(2, 'La fuente de la pensión debe tener al menos 2 caracteres')
          .max(100, 'La fuente no puede exceder 100 caracteres'),
        monto: z
          .number({ invalid_type_error: 'El monto debe ser un número' })
          .min(0, 'El monto no puede ser negativo'),
      }),
      z.object({
        tipo: z.literal('otro'),
        descripcion: z
          .string()
          .min(2, 'La descripción debe tener al menos 2 caracteres')
          .max(100, 'La descripción no puede exceder 100 caracteres'),
      }),
      z.object({
        tipo: z.literal('desempleado'),
        dependiente: z.enum(["padre", "madre", "hermano", "otro"], { required_error: "El dependiente es requerido" }),
      }),
    ]
  ).optional(),

  // Relaciones Personales
  relacionCompa: z.enum(["excelente", "buena", "regular", "mala"], { required_error: "La relación con compañeros es requerida" }),
  integracionUmet: z.enum(["si", "no"], { required_error: "La integración en UMET es requerida" }),
  relacionDocente: z.enum(["excelente", "buena", "regular", "mala"], { required_error: "La relación con el docente es requerida" }),
  relacionPadres: z.enum(["excelente", "buena", "regular", "mala"], { required_error: "La relación con los padres es requerida" }),
  relacionPareja: z.enum(["excelente", "buena", "regular", "mala"], { required_error: "La relación con la pareja es requerida" }).optional(),

  // Familia
  estadoFamiliar: z.enum(["cabezaHogar", "vivePadres", "independiente", "otro"], { required_error: "El estado familiar es requerido" }),
  miembros: z
    .array(
      z.object({
        sueldo: z
          .number({ invalid_type_error: 'El sueldo debe ser un número' })
          .min(0, 'El sueldo no puede ser negativo'),
        edad: z.number()
          .min(1, "La edad es requerida")
          .max(100, "La edad no puede exceder 100 años"),
        parentesco: z.enum(["hijo", "padre", "madre", "hermano", "conyuge", "otro"], { required_error: "El parentesco es requerido" }),
        ocupacion: z.enum(["primaria", "secundaria", "bachillerato", "universidad", "otro"], { required_error: "La instrucción académica es requerida" }),
      })
    )
    .optional(),

    // Salud
    tieneDiscapacidad: z.enum(["si", "no"], { required_error: "La discapacidad es requerida" }),
    discapacidad: z.object({
      tipo: z.enum(["fisica", "psiquica", "auditiva", "visual", "intelectual", "multiple"], { required_error: "El tipo de discapacidad es requerido" }),
      porcentaje: z.number().int().min(10, "El porcentaje de discapacidad debe ser al menos 10%").max(100, "El porcentaje de discapacidad no puede exceder 100%"),
      carnet: z.string().min(1, "El carnet de discapacidad es requerido"),
    }).optional(),

    tieneEnfermedadCronica: z.enum(["si", "no"], { required_error: "La enfermedad crónica es requerida" }),
    enfermedadCronica: z.object({
      nombre: z.string().min(1, "El nombre de la enfermedad es requerido"),
      lugaresTratamiento: z.enum(["clinicaPrivada", "publica", "iess", "otro"], { required_error: "El lugar de tratamiento es requerido" }),
    }).optional(),

  // Documentos
  // documentos: z.instanceof(FileList)
  //   .refine((files) => files.length > 0, "Debe subir al menos un documento")
})

type FormData = z.infer<typeof formSchema>;

const nacionalidadesIndigenas = [
  { value: 1, label: "Tsáchila" },
  { value: 2, label: "Waorani" },
  { value: 3, label: "Zápara" },
  { value: 4, label: "Andoa" },
  { value: 5, label: "Kichwa" },
  { value: 6, label: "Pastos" },
  { value: 7, label: "Natabuela" },
  { value: 8, label: "Otavalo" },
  { value: 9, label: "Karanki" },
  { value: 10, label: "Kayambi" },
  { value: 11, label: "Kitukara" },
  { value: 12, label: "Panzaleo" },
  { value: 13, label: "Chibuleo" },
  { value: 14, label: "Salasaka" },
  { value: 15, label: "Kisapincha" },
  { value: 16, label: "Tomabela" },
  { value: 17, label: "Waranka" },
  { value: 18, label: "Puruha" },
  { value: 19, label: "Kañari" },
  { value: 20, label: "Saraguro" },
  { value: 21, label: "Paltas" },
  { value: 22, label: "Manta" },
  { value: 23, label: "Huancavilca" },
  { value: 24, label: "Achuar" },
  { value: 25, label: "Awá" },
  { value: 26, label: "Al Cofán" },
  { value: 27, label: "Chachi" },
  { value: 28, label: "Épera" },
  { value: 29, label: "Huaorani" },
  { value: 30, label: "Secoya" },
  { value: 31, label: "Shuar" },
  { value: 32, label: "Siona" },
  { value: 33, label: "Shiwiar" },
  { value: 34, label: "No Registra" },
];

interface Ubicacion {
  id: string;
  nombre: string;
  provinciaId?: string;
  ciudadId?: string;
}

type Props = {
  onSuccess: (data: { id: string }) => void;
  defaultData?: FormData;
};

interface ClienteData {
  cllc_cdg: string; // O el tipo correcto de acuerdo con tu base de datos
  cllc_ruc: string;
  cllc_nmb: string;
  cllc_email: string;
  cllc_celular: string;
}

interface ClienteResponse {
  message: string;
  data: ClienteData | null;
}

export default function FormSocioeconomico({ onSuccess }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
    control
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      nombres: '',
      cedula: '',
      fechaNacimiento: '',
      genero: undefined,
      estadoCivil: undefined,
      telefono: '',
      direccion: '',
      provinciaId: '',
      ciudadId: '',
      parroquiaId: '',
      anioGraduacion: undefined,
      situacionLaboral: undefined,
      laboral: undefined,
      estadoFamiliar: undefined,
      miembros: [],
      estudioOtraUniversidad: false,
      otraUniversidad: undefined,
      discapacidad: undefined,
      enfermedadCronica: undefined,
      etnia: "mestizo",
      nacionalidad: "ecuatoriano",
    }
  });

  // const { suggestions, checkSpelling } = useSpellcheck();
  const { suggestions, setSuggestions, checkSpelling } = useSpellcheck();
  const estudioOtraUniversidad = useWatch({ control, name: "estudioOtraUniversidad" });
  const situacionLaboral = useWatch({ control, name: 'situacionLaboral' });
  const estadoCivil = useWatch({ control, name: 'estadoCivil' });
  const estadoFamiliar = useWatch({ control, name: 'estadoFamiliar' });
  const etniaSeleccionada  = useWatch({ control, name: 'etnia' });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'miembros',
  });
  const tieneDiscapacidad = useWatch({ control, name: 'tieneDiscapacidad' });
  const tieneEnfermedadCronica = useWatch({ control, name: 'tieneEnfermedadCronica' });

  const onSubmit = async (data: FormData) => {
    console.log(data);
    // Aquí se enviaría la información al backend
    try {
      const response = await axiosInstance.post(`/ficha/ficha-socioeconomica`, data);

      const result = response.data as { ficha: { id: string } };
      onSuccess(result.ficha);
    } catch (error: any) {
      if (error.response) {
        // El servidor respondió con un código diferente a 2xx
        console.error("Error del backend:", error.response.data);
        // Aquí puedes mostrar error.response.data.detail al usuario si es un 422 de FastAPI
      } else if (error.request) {
        // La solicitud fue hecha pero no se recibió respuesta
        console.error("No se recibió respuesta del servidor:", error.request);
      } else {
        // Ocurrió un error al configurar la solicitud
        console.error("Error al configurar la solicitud:", error.message);
      }
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
  const handleProvinciaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
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
  const handleCiudadChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
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

  // Limpiar campos de laboral cuando cambia situacionLaboral
  const handleSituacionLaboralChange = (value: string) => {
    setValue('situacionLaboral', value as 'empleado' | 'negocio propio' | 'desempleado' | 'pensionado' | 'otro', { shouldValidate: true });
    if (value === 'desempleado') {
      console.log('desempleado', value);
      setValue('laboral', undefined, { shouldValidate: true });
    } else {
      switch (value) {
        case 'empleado':
          setValue('laboral', { tipo: 'empleado', empresa: '', cargo: '', sueldo: 0 }, { shouldValidate: true });
          break;
        case 'negocio propio':
          setValue('laboral', { tipo: 'negocio propio', negocio: '', ingresos: 0, gastos: 0, actividades: '' }, { shouldValidate: true });
          break;
        case 'pensionado':
          setValue('laboral', { tipo: 'pensionado', fuente: '', monto: 0 }, { shouldValidate: true });
          break;
        case 'otro':
          setValue('laboral', { tipo: 'otro', descripcion: '' }, { shouldValidate: true });
          break;
      }
    }
  };

  const handleEstudioOtraUniversidadChange = (value: boolean) => {
    setValue('estudioOtraUniversidad', value, { shouldValidate: true });

    if (!value) {
      // Si no estudió en otra universidad, se limpia la información
      setValue('otraUniversidad', undefined, { shouldValidate: true });
    } else {
      // Si estudió en otra universidad, se inicializan los campos
      setValue('otraUniversidad', { nombre: '', carrera: '', razon: '' }, { shouldValidate: true });
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axiosInstance.get<ClienteResponse>(`/cliente/me`);
        if (response.status !== 200) throw new Error("Error al obtener datos del usuario");

        const userData = response.data;
        if (userData.data) {
          const { cllc_nmb, cllc_ruc, cllc_celular, cllc_email } = userData.data;
          // Rellenar los valores del formulario
          setValue("nombres", cllc_nmb);
          setValue("cedula", cllc_ruc);
          setValue("telefono", cllc_celular);
          setValue("email", cllc_email);
        }
      } catch (error) {
        console.error("Error cargando datos del usuario:", error);
      }
    };

    fetchUserData();
  }, []);

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
              error={!!errors.nombres}
              hint={errors.nombres?.message}
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
          <div>
            <Label>Nacionalidad <span className="text-error-500">*</span></Label>
            <Select
              options={[
                { value: "ecuatoriano", label: "Ecuatoriano/a" },
                { value: "venezolano", label: "Venezolano/a" },
                { value: "colombiano", label: "Colombiano/a" },
                { value: "extranjero", label: "Extranjero/a" }
              ]}
              onChange={(value) => setValue("nacionalidad", value)}
              placeholder="Seleccione su nacionalidad"
              defaultValue="ecuatoriano"
            />
            {errors.nacionalidad && (
              <p className="mt-1 text-sm text-error-500">{errors.nacionalidad.message}</p>
            )}
          </div>
          <div>
            <Label>Reconocimiento etnico <span className="text-error-500">*</span></Label>
            <Select
              options={[
                { value: "mestizo", label: "Mestizo" },
                { value: "indigena", label: "Indígena" },
                { value: "blanco", label: "Blanco" },
                { value: "afroecuatoriano", label: "Afroecuatoriano/a" },
                { value: "montubio", label: "Montubio" },
                { value: "mulato", label: "Mulatto" },
                { value: "negro", label: "Negro" },
                { value: "otro", label: "Otro" },
                { value: "ninguno", label: "No Registra" },
              ]}
              onChange={(value) => setValue("etnia", value as "mestizo" | "indigena" | "blanco" | "afroecuatoriano" | "montubio" | "mulato" | "negro" | "otro" | "ninguno")}
              placeholder="Seleccione su etnia"
              defaultValue="mestizo"
            />
            {errors.etnia && (
              <p className="mt-1 text-sm text-error-500">{errors.etnia.message}</p>
            )}
          </div>
          {etniaSeleccionada === "indigena" && (
            <div>
              <Label>Nacionalidad Indígena <span className="text-error-500">*</span></Label>
              <Select
                options={nacionalidadesIndigenas.map(nacionalidad => ({ value: nacionalidad.value.toString(), label: nacionalidad.label }))}
                onChange={(value) => setValue("indigenaNacionalidad", parseInt(value))}
                placeholder="Seleccione su nacionalidad indigena"
              />
              {errors.indigenaNacionalidad && (
                <p className="mt-1 text-sm text-error-500">{errors.indigenaNacionalidad.message}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sección 2: Información Académica */}
      <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-800">
        <h3 className="mb-4 text-lg font-semibold">Información Académica</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <Label>Colegio <span className="text-error-500">*</span></Label>
            <Input
              register={register("colegio", {
                onBlur: async (e) => {
                  const value = e.target.value;
                  await checkSpelling("colegio", value);
                }
              })}
              error={!!errors.colegio || !!suggestions.colegio}
              hint={errors.colegio?.message}
            />
            {suggestions.colegio && (
              <div className="mt-1 text-sm text-yellow-600 cursor-pointer underline"
                onClick={() => {
                  setValue("colegio", suggestions.colegio);
                  setSuggestions((prevState) => ({ ...prevState, colegio: "" }));
                }}>
                Quizás quisiste decir: {suggestions.colegio}
              </div>
            )}
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
              register={register("anioGraduacion", { valueAsNumber: true })}
              error={!!errors.anioGraduacion}
              hint={errors.anioGraduacion?.message}
            />
          </div>
          <div>
            <Label>Promedio de Grado <span className="text-error-500">*</span></Label>
            <Input
              type="number"
              step={0.01}
              register={register("promedio", { valueAsNumber: true })}
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
              register={register("carrera", {
                onBlur: async (e) => {
                  const value = e.target.value;
                  await checkSpelling("carrera", value);
                }
              })}
              error={!!errors.carrera || !!suggestions.carrera}
              hint={errors.carrera?.message}
            />
            {suggestions.carrera && (
              <div className="mt-1 text-sm text-yellow-600 cursor-pointer underline"
                onClick={() => {
                  setValue("carrera", suggestions.carrera);
                  setSuggestions((prevState) => ({ ...prevState, carrera: "" }));
                }}>
                Quizás quisiste decir: {suggestions.carrera}
              </div>
            )}
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
              ¿Estudio en otra Universidad su carrera?
              <input
                type="checkbox" id="estudioOtraUniversidad"
                {...register("estudioOtraUniversidad")}
                onChange={(e) => handleEstudioOtraUniversidadChange(e.target.checked)}
              />
            </label>
          </div>
          {estudioOtraUniversidad && (
            <div className="col-span-1 sm:col-span-2">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
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
                <div>
                  <Label>Razon del cambio de universidad <span className="text-error-500">*</span></Label>
                  <Input
                    register={register("otraUniversidad.razon")}
                    error={!!errors.otraUniversidad?.razon}
                    hint={errors.otraUniversidad?.razon?.message}
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
          <div>
            <Label>Tiene internet en casa? <span className="text-error-500">*</span></Label>
            <input type="checkbox" {...register("internet")} />
          </div>
          <div>
            <Label>Cuenta con una computadora/laptop en casa? <span className="text-error-500">*</span></Label>
            <input type="checkbox" {...register("computadora")} />
          </div>
        </div>
      </div>
      {/* Sección 5: Información Laboral */}
      <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-800">
        <h3 className="mb-4 text-lg font-semibold">Información Laboral</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <Label>Situación Laboral <span className="text-error-500">*</span></Label>
            <Select
              options={[
                { value: "empleado", label: "Empleado" },
                { value: "negocio propio", label: "Negocio propio" },
                { value: "desempleado", label: "Desempleado" },
                { value: "pensionado", label: "Pensionado" },
                { value: "otro", label: "Otro" }
              ]}
              onChange={(value) => {
                setValue('situacionLaboral', value as 'empleado' | 'negocio propio' | 'desempleado' | 'pensionado' | 'otro', { shouldValidate: true });
                handleSituacionLaboralChange(value);
              }}
              placeholder="Seleccione su situación laboral"
            >
            </Select>
            {errors.situacionLaboral && (
              <p className="mt-1 text-sm text-error-500">{errors.situacionLaboral.message}</p>
            )}
          </div>
        </div>

        {/* Campos condicionales para Empleado */}
        {situacionLaboral === "empleado" && (
          <div>
            <div>
              <Label>Empresa <span className="text-error-500">*</span></Label>
              <Input
                register={register("laboral.empresa")}
                error={!!(errors.laboral as any)?.empresa}
                hint={(errors.laboral as any)?.empresa?.message}
              />
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <Label>Cargo <span className="text-error-500">*</span></Label>
                <Input
                  register={register("laboral.cargo")}
                  error={!!(errors.laboral as any)?.cargo}
                  hint={(errors.laboral as any)?.cargo?.message}
                />
              </div>
              <div>
                <Label>Sueldo <span className="text-error-500">*</span></Label>
                <Input
                  type="number"
                  step={0.01}
                  register={register("laboral.sueldo", { valueAsNumber: true })}
                  error={!!(errors.laboral as any)?.sueldo}
                  hint={(errors.laboral as any)?.sueldo?.message}
                />
              </div>
            </div>
          </div>
        )}
        {situacionLaboral === "negocio propio" && (
          <div>
            <div>
              <Label>Nombre delNegocio <span className="text-error-500">*</span></Label>
              <Input
                register={register("laboral.negocio")}
                error={!!(errors.laboral as any)?.negocio}
                hint={(errors.laboral as any)?.negocio?.message}
              />
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <Label>Ingresos <span className="text-error-500">*</span></Label>
                <Input
                  type="number"
                  step={0.01}
                  register={register("laboral.ingresos")}
                  error={!!(errors.laboral as any)?.ingresos}
                  hint={(errors.laboral as any)?.ingresos?.message}
                />
              </div>
              <div>
                <Label>Gastos <span className="text-error-500">*</span></Label>
                <Input
                  type="number"
                  step={0.01}
                  register={register("laboral.gastos")}
                  error={!!(errors.laboral as any)?.gastos}
                  hint={(errors.laboral as any)?.gastos?.message}
                />
              </div>
            </div>
            <div>
              <Label>Actividades <span className="text-error-500">*</span></Label>
              <Input
                register={register("laboral.actividades")}
                error={!!(errors.laboral as any)?.actividades}
                hint={(errors.laboral as any)?.actividades?.message}
              />
            </div>
          </div>
        )}

        {situacionLaboral === "pensionado" && (
          <div>
            <Label>Fuente de la pensión <span className="text-error-500">*</span></Label>
            <Input
              register={register("laboral.fuente")}
              error={!!(errors.laboral as any)?.fuente}
              hint={(errors.laboral as any)?.fuente?.message}
            />
          </div>
        )}

        {situacionLaboral === "otro" && (
          <div>
            <Label>Descripción <span className="text-error-500">*</span></Label>
            <Input
              register={register("laboral.descripcion")}
              error={!!(errors.laboral as any)?.descripcion}
              hint={(errors.laboral as any)?.descripcion?.message}
            />
          </div>
        )}
        {situacionLaboral === "desempleado" && (
          <div>
            <Label>Economicamente dependiente de <span className="text-error-500">*</span></Label>
            <Select
              options={[
                { value: "padre", label: "Padre" },
                { value: "madre", label: "Madre" },
                { value: "hermano", label: "Hermano" },
                { value: "otro", label: "Otro" }
              ]}
              onChange={(value) => {
                setValue('laboral.tipo', 'desempleado', { shouldValidate: true });
                setValue('laboral.dependiente', value as 'padre' | 'madre' | 'hermano' | 'otro', { shouldValidate: true });
              }}
              placeholder="Seleccione su situación laboral"
            >
            </Select>
          </div>
        )}
      </div>

      {/* Sección 6: Relaciones Personales */}
      <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-800">
        <h3 className="mb-4 text-lg font-semibold">Relaciones Personales</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <Label>Relacion con compañeros <span className="text-error-500">*</span></Label>
            <Select
              options={[
                { value: "excelente", label: "Excelente" },
                { value: "buena", label: "Buena" },
                { value: "regular", label: "Regular" },
                { value: "mala", label: "Mala" }
              ]}
              onChange={(value) => setValue("relacionCompa", value as "excelente" | "buena" | "regular" | "mala")}
              placeholder="Seleccione su relación con compañeros"
            />
            {errors.relacionCompa && (
              <p className="mt-1 text-sm text-error-500">{errors.relacionCompa.message}</p>
            )}
          </div>
          <div>
            <Label>Integración en UMET <span className="text-error-500">*</span></Label>
            <Select
              options={[
                { value: "si", label: "Si" },
                { value: "no", label: "No" }
              ]}
              onChange={(value) => setValue("integracionUmet", value as "si" | "no")}
              placeholder="Seleccione su integración en UMET"
            />
            {errors.integracionUmet && (
              <p className="mt-1 text-sm text-error-500">{errors.integracionUmet.message}</p>
            )}
          </div>
          <div>
            <Label>Relacion con el docente <span className="text-error-500">*</span></Label>
            <Select
              options={[
                { value: "excelente", label: "Excelente" },
                { value: "buena", label: "Buena" },
                { value: "regular", label: "Regular" },
                { value: "mala", label: "Mala" }
              ]}
              onChange={(value) => setValue("relacionDocente", value as "excelente" | "buena" | "regular" | "mala")}
              placeholder="Seleccione su relación con el docente"
            />
            {errors.relacionDocente && (
              <p className="mt-1 text-sm text-error-500">{errors.relacionDocente.message}</p>
            )}
          </div>
          <div>
            <Label>Relacion con los padres <span className="text-error-500">*</span></Label>
            <Select
              options={[
                { value: "excelente", label: "Excelente" },
                { value: "buena", label: "Buena" },
                { value: "regular", label: "Regular" },
                { value: "mala", label: "Mala" }
              ]}
              onChange={(value) => setValue("relacionPadres", value as "excelente" | "buena" | "regular" | "mala")}
              placeholder="Seleccione su relación con los padres"
            />
            {errors.relacionPadres && (
              <p className="mt-1 text-sm text-error-500">{errors.relacionPadres.message}</p>
            )}
          </div>
          {estadoCivil === "casado" && (
            <div>
              <Label>Relacion con la pareja <span className="text-error-500">*</span></Label>
              <Select
                options={[
                  { value: "excelente", label: "Excelente" },
                  { value: "buena", label: "Buena" },
                  { value: "regular", label: "Regular" },
                  { value: "mala", label: "Mala" }
                ]}
                onChange={(value) => setValue("relacionPareja", value as "excelente" | "buena" | "regular" | "mala")}
                placeholder="Seleccione su relación con la pareja"
              />
              {errors.relacionPareja && (
                <p className="mt-1 text-sm text-error-500">{errors.relacionPareja.message}</p>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Sección 7: Familia */}
      <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-800">
        <h3 className="mb-4 text-lg font-semibold">Familia</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Estado Familiar */}
          <div className="col-span-1 sm:col-span-2">
            <Label>
              Estado Familiar <span className="text-error-500">*</span>
            </Label>
            <Select
              options={[
                { value: 'cabezaHogar', label: 'Cabeza de hogar' },
                { value: 'vivePadres', label: 'Vive con sus padres' },
                { value: 'independiente', label: 'Independiente' },
                { value: 'otro', label: 'Otro' },
              ]}
              onChange={(value) => {
                setValue('estadoFamiliar', value as 'cabezaHogar' | 'vivePadres' | 'independiente' | 'otro', { shouldValidate: true });
                if (value === 'independiente') {
                  setValue('miembros', [], { shouldValidate: true });
                }
              }}
              placeholder="Seleccione su estado familiar"
            />
            {errors.estadoFamiliar && (
              <p className="mt-1 text-sm text-error-500">{errors.estadoFamiliar.message}</p>
            )}
          </div>
          {/* Miembros (condicional para cabezaHogar o vivePadres) */}
          {(estadoFamiliar === 'cabezaHogar' || estadoFamiliar === 'vivePadres') && (
            <div className="col-span-1 sm:col-span-2">
              <h4 className="mb-4 text-lg font-semibold">
                {estadoFamiliar === 'cabezaHogar' ? 'Miembros de la familia' : 'Miembros del hogar'}
              </h4>
              {fields.map((field, index) => (
                <div key={field.id} className="mb-4 rounded-md border border-gray-300 p-4">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {/* Parentesco */}
                    <div>
                      <Label>
                        Parentesco <span className="text-error-500">*</span>
                      </Label>
                      <Select
                        options={[
                          { value: 'conyuge', label: 'Cónyuge' },
                          { value: 'hijo', label: 'Hijo/a' },
                          { value: 'padre', label: 'Padre' },
                          { value: 'madre', label: 'Madre' },
                          { value: 'hermano', label: 'Hermano/a' },
                          { value: 'otro', label: 'Otro' },
                        ]}
                        onChange={(value) => setValue(`miembros.${index}.parentesco`, value as 'conyuge' | 'hijo' | 'padre' | 'madre' | 'hermano' | 'otro')}
                        placeholder="Seleccione el parentesco"
                      />
                      {errors.miembros?.[index]?.parentesco && (
                        <p className="mt-1 text-sm text-error-500">
                          {errors.miembros?.[index]?.parentesco?.message}
                        </p>
                      )}
                    </div>
                    {/* Edad */}
                    <div>
                      <Label>
                        Edad <span className="text-error-500">*</span>
                      </Label>
                      <Input
                        type="number"
                        step={1}
                        register={register(`miembros.${index}.edad`, {
                          valueAsNumber: true,
                        })}
                        error={!!errors.miembros?.[index]?.edad}
                        hint={errors.miembros?.[index]?.edad?.message}
                      />
                    </div>

                    {/* Sueldo */}
                    <div>
                      <Label>
                        Sueldo <span className="text-error-500">*</span>
                      </Label>
                      <Input
                        type="number"
                        step={0.01}
                        register={register(`miembros.${index}.sueldo`, {
                          valueAsNumber: true,
                        })}
                        error={!!errors.miembros?.[index]?.sueldo}
                        hint={errors.miembros?.[index]?.sueldo?.message}
                      />
                    </div>

                    {/* Ocupación */}
                    <div>
                      <Label>Instrucción académica <span className="text-error-500">*</span></Label>
                      <Select
                        options={[
                          { value: 'primaria', label: 'Primaria' },
                          { value: 'secundaria', label: 'Secundaria' },
                          { value: 'bachillerato', label: 'Bachillerato' },
                          { value: 'universidad', label: 'Universidad' },
                          { value: 'otro', label: 'Otro' },
                        ]}
                        onChange={(value) => setValue(`miembros.${index}.ocupacion`, value as 'primaria' | 'secundaria' | 'bachillerato' | 'universidad' | 'otro')}
                        placeholder="Seleccione su instrucción académica"
                      />
                      
                      {errors.miembros?.[index]?.ocupacion && (
                        <p className="mt-1 text-sm text-error-500">
                          {errors.miembros?.[index]?.ocupacion?.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="mt-4 rounded-md bg-error-500 px-4 py-2 text-white hover:bg-error-600"
                    onClick={() => remove(index)}
                  >
                    Eliminar miembro
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="mt-4 rounded-md bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-600"
                onClick={() => append({ sueldo: 0, edad: 0, parentesco: 'otro', ocupacion: 'otro' })}
              >
                Agregar miembro
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sección 8: Salud */}
      {/* Salud */}
      <div className="rounded-lg border border-gray-200 p-6">
        <h3 className="mb-4 text-lg font-semibold">Salud</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* ¿Presenta discapacidad? */}
          <div className="col-span-1 sm:col-span-2">
            <Label>
              ¿Presenta discapacidad? <span className="text-error-500">*</span>
            </Label>
            <Select
              options={[
                { value: 'si', label: 'Sí' },
                { value: 'no', label: 'No' },
              ]}
              onChange={(value) => {
                setValue('tieneDiscapacidad', value as 'si' | 'no', { shouldValidate: true });
                if (value === 'no') {
                  setValue('discapacidad', undefined, { shouldValidate: true });
                } else {
                  setValue('discapacidad', { tipo: 'fisica', porcentaje: 0, carnet: '' }, { shouldValidate: true });
                  setValue('discapacidad.carnet', getValues('cedula') );
                }
              }}
              placeholder="Seleccione una opción"
            />
            {errors.tieneDiscapacidad && (
              <p className="mt-1 text-sm text-error-500">{errors.tieneDiscapacidad.message}</p>
            )}
          </div>

          {/* Campos condicionales para discapacidad */}
          {tieneDiscapacidad === 'si' && (
            <div className="col-span-1 sm:col-span-2">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <Label>
                    Nombre de la discapacidad <span className="text-error-500">*</span>
                  </Label>
                  <Select
                    options={[
                      { value: 'fisica', label: 'Física' },
                      { value: 'psiquica', label: 'Psíquica' },
                      { value: 'auditiva', label: 'Auditiva' },
                      { value: 'visual', label: 'Visual' },
                      { value: 'intelectual', label: 'Intelectual' },
                      { value: 'multiple', label: 'Múltiple' },
                    ]}
                    onChange={(value) => setValue('discapacidad.tipo', value as 'fisica' | 'psiquica' | 'auditiva' | 'visual' | 'intelectual' | 'multiple', { shouldValidate: true })}
                    placeholder="Seleccione el tipo de discapacidad"
                  />
                </div>
                <div>
                  <Label>
                    Porcentaje de discapacidad <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    step={0.01}
                    register={register('discapacidad.porcentaje', { valueAsNumber: true })}
                    error={!!errors.discapacidad?.porcentaje}
                    hint={errors.discapacidad?.porcentaje?.message}
                  />
                </div>
                <div>
                  <Label>
                    Número de carné de discapacidad <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    register={register('discapacidad.carnet')}
                    error={!!errors.discapacidad?.carnet}
                    hint={errors.discapacidad?.carnet?.message}
                    readOnly={true}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ¿Tiene enfermedad crónica? */}
          <div className="col-span-1 sm:col-span-2">
            <Label>
              ¿Tiene alguna enfermedad crónica? <span className="text-error-500">*</span>
            </Label>
            <Select
              options={[
                { value: 'si', label: 'Sí' },
                { value: 'no', label: 'No' },
              ]}
              onChange={(value) => {
                setValue('tieneEnfermedadCronica', value as 'si' | 'no', { shouldValidate: true });
                if (value === 'no') {
                  setValue('enfermedadCronica', undefined, { shouldValidate: true });
                } else {
                  setValue('enfermedadCronica', { nombre: '', lugaresTratamiento: 'otro' }, { shouldValidate: true });
                }
              }}
              placeholder="Seleccione una opción"
            />
            {errors.tieneEnfermedadCronica && (
              <p className="mt-1 text-sm text-error-500">{errors.tieneEnfermedadCronica.message}</p>
            )}
          </div>

          {/* Campos condicionales para enfermedad crónica */}
          {tieneEnfermedadCronica === 'si' && (
            <div className="col-span-1 sm:col-span-2">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <Label>
                    Nombre de la enfermedad <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    register={register('enfermedadCronica.nombre')}
                    error={!!errors.enfermedadCronica?.nombre}
                    hint={errors.enfermedadCronica?.nombre?.message}
                  />
                </div>
                <div>
                    <Label>
                      Lugar de tratamiento <span className="text-error-500">*</span>
                    </Label>
                    <Select
                      options={[
                        { value: 'clinicaPrivada', label: 'Clínica privada' },
                        { value: 'publica', label: 'Pública' },
                        { value: 'iess', label: 'IESS' },
                        { value: 'otro', label: 'Otro' },
                      ]}
                      onChange={(value) =>
                        setValue('enfermedadCronica.lugaresTratamiento', value as 'clinicaPrivada' | 'publica' | 'iess' | 'otro', { shouldValidate: true })
                      }
                      placeholder="Seleccione el lugar de tratamiento"
                    />
                    {errors.enfermedadCronica?.lugaresTratamiento && (
                      <p className="mt-1 text-sm text-error-500">
                        {errors.enfermedadCronica.lugaresTratamiento.message}
                      </p>
                    )}
                </div>
              </div>
            </div>
          )}
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