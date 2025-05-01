import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
// import { useSpellcheck } from "../../hooks/useSpellcheck";
import Form from "../ficha/Form";
import Label from "../ficha/Label";
import Input from "../ficha/input/InputField";
import Select from "../ficha/Select";
import { useEffect, useState } from "react";
import axiosInstance from "../../services/axiosInstance";
import { FichaSocioeconomica } from "../../types/fichasocioeconomica";
import AsyncSelect from "../ficha/AsyncSelect";


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
    .regex(/^\d{10}$/, "El teléfono debe tener exactamente 10 dígitos numéricos, no espacios en blanco"),
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
    .min(2, "Seleccione una carrera"),

  colegio: z.string()
    .min(2, "El nombre del colegio debe tener al menos 2 caracteres")
    .max(100, "El nombre del colegio no puede exceder 100 caracteres"),
  tipoColegio: z.string()
    .min(1, "El tipo de colegio es requerido"),
  anioGraduacion: z.number().int().min(1900, 'Año inválido').max(2025, 'Año inválido'),
  semestre: z.string()
    .min(1, "El semestre es requerido"),

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

  beca: z.string().nullable().optional(),
  internet: z.boolean().optional(),
  computadora: z.boolean().optional(),

  // Información Económica
  ingresosFamiliares: z.string()
    .min(1, "Los ingresos familiares son requeridos"),

  gastosMensuales: z.string()
    .min(1, "Los gastos mensuales son requeridos"),

  vivienda: z.string()
    .min(1, "Los gastos en vivienda son requeridos"),
    // .regex(/^\d+(\.\d{1,2})?$/, "Los gastos deben ser un número con máximo 2 decimales"),
  transporte: z.string()
    .min(1, "Los gastos en transporte son requeridos"),

  alimentacion: z.string()
    .min(1, "Los gastos en alimentación son requeridos"),

  otrosGastos: z.string()
    .min(1, "Los otros gastos son requeridos"),
    

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
        sueldo: z.string()
          .min(1, "El sueldo no puede ser negativo"),
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
  tipoCasa: z.string().min(1, "El tipo de casa es requerido"),
  miembros: z
    .array(
      z.object({
        sueldo: z.string().min(1, "El sueldo es requerido"),
        edad: z.string().min(1, "La edad es requerida"),
        parentesco: z.enum(["hijo", "padre", "madre", "hermano", "conyuge", "otro"], { required_error: "El parentesco es requerido" }),
        ocupacion: z.string().min(1, "La Instrucción Académica es requerida"),
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

// interface Ubicacion {
//   id: string;
//   nombre: string;
//   provinciaId?: string;
//   ciudadId?: string;
// }

type Props = {
  onSuccess: (data: FichaSocioeconomica) => void;
  defaultData: FichaSocioeconomica;
};

// interface ClienteData {
//   cllc_cdg: string; // O el tipo correcto de acuerdo con tu base de datos
//   cllc_ruc: string;
//   cllc_nmb: string;
//   cllc_email: string;
//   cllc_celular: string;
//   cllc_fecha_nac: string;
//   alu_genero: string;
// }

// interface ClienteResponse {
//   message: string;
//   data: ClienteData | null;
// }

const generoLabels: Record<string, string> = {
  M: "Masculino",
  F: "Femenino",
  "": "No informado",
};

const tipoColegioOptions = [
  { value: "1", label: "NO REGISTRA" },
  { value: "2", label: "PARTICULAR" },
  { value: "3", label: "FISCAL" },
  { value: "4", label: "FISCOMISIONAL" },
  { value: "5", label: "MILITARES Y AFINES" },
  { value: "6", label: "MUNICIPAL" },
  { value: "7", label: "EXTRANJERO" },
  { value: "8", label: "PRIVADO" },
];

interface Provincia {
  id: string;
  nombre: string;
}

interface Ciudad {
  id: string;
  nombre: string;
}

interface Parroquia {
  id: string;
  nombre: string;
}

export default function FormSocioeconomico({ onSuccess, defaultData }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
    control,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...defaultData,
      carrera: defaultData.carrera.id || "",
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
    }
  });

  // const { suggestions, checkSpelling } = useSpellcheck();
  // const { suggestions, setSuggestions, checkSpelling } = useSpellcheck();
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

      const result = response.data as { ficha: FichaSocioeconomica };
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
  // const [ciudadesFiltradas, setCiudadesFiltradas] = useState<Ubicacion[]>([]);
  // const [parroquiasFiltradas, setParroquiasFiltradas] = useState<Ubicacion[]>([]);

  // Función para manejar el cambio de provincia
  // const handleProvinciaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   const provinciaId = e.target.value;

  //   // Actualizar el valor de provinciaId en el formulario
  //   setValue("provinciaId", provinciaId);

  //   // Filtrar ciudades basado en la provincia seleccionada
  //   if (provinciaId) {
  //     const ciudades = locationData.ciudades.filter(
  //       ciudad => ciudad.provinciaId === provinciaId
  //     );
  //     setCiudadesFiltradas(ciudades);
  //   } else {
  //     setCiudadesFiltradas([]);
  //   }

  //   // Resetear ciudad y parroquia
  //   setValue("ciudadId", "");
  //   setValue("parroquiaId", "");
  //   setParroquiasFiltradas([]);
  // };

  // Función para manejar el cambio de ciudad
  // const handleCiudadChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   const ciudadId = e.target.value;

  //   // Actualizar el valor de ciudadId en el formulario
  //   setValue("ciudadId", ciudadId);

  //   // Filtrar parroquias basado en la ciudad seleccionada
  //   if (ciudadId) {
  //     const parroquias = locationData.parroquias.filter(
  //       parroquia => parroquia.ciudadId === ciudadId
  //     );
  //     setParroquiasFiltradas(parroquias);
  //   } else {
  //     setParroquiasFiltradas([]);
  //   }

  //   // Resetear parroquia
  //   setValue("parroquiaId", "");
  // };

  // Limpiar campos de laboral cuando cambia situacionLaboral
  const handleSituacionLaboralChange = (value: string) => {
    setValue('situacionLaboral', value as 'empleado' | 'negocio propio' | 'desempleado' | 'pensionado' | 'otro', { shouldValidate: true });
    if (value === 'desempleado') {
      console.log('desempleado', value);
      setValue('laboral', undefined, { shouldValidate: true });
    } else {
      switch (value) {
        case 'empleado':
          setValue('laboral', { tipo: 'empleado', empresa: '', cargo: '', sueldo: "" }, { shouldValidate: true });
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

  // useEffect(() => {
  //   const fetchUserData = async () => {
  //     try {
  //       const response = await axiosInstance.get<ClienteResponse>(`/cliente/me`);
  //       if (response.status !== 200) throw new Error("Error al obtener datos del usuario");

  //       const userData = response.data;
  //       if (userData.data) {
  //         const { cllc_nmb, cllc_ruc, cllc_celular, cllc_email, cllc_fecha_nac, alu_genero } = userData.data;
  //         console.log('data', userData.data);
  //         // Rellenar los valores del formulario
  //         setValue("nombres", cllc_nmb);
  //         setValue("cedula", cllc_ruc);
  //         setValue("telefono", cllc_celular);
  //         setValue("email", cllc_email);
  //         setValue("fechaNacimiento", new Date(cllc_fecha_nac).toISOString().split('T')[0]);
  //         setValue("genero", alu_genero);
  //       }
  //     } catch (error) {
  //       console.error("Error cargando datos del usuario:", error);
  //     }
  //   };

  //   fetchUserData();
  // }, []);
   // Cuando cambia la provincia, obtener las ciudades
  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [ciudadesFiltradas, setCiudadesFiltradas] = useState<Ciudad[]>([]);
  const [parroquiasFiltradas, setParroquiasFiltradas] = useState<Parroquia[]>([]);

  const provinciaId = watch("provinciaId");
  const ciudadId = watch("ciudadId");

  // Cargar Provincias
  useEffect(() => {
    const fetchProvincias = async () => {
      try {
        const response = await axiosInstance.get<Provincia[]>(`/ficha/provincias`);
        setProvincias(response.data);
      } catch (error) {
        console.error("Error al cargar las ciudades:", error);
      }
    };
    fetchProvincias();
  }, [provinciaId, setValue]);

  // Cuando cambia la provincia, obtener las ciudades
  useEffect(() => {
    const fetchCiudades = async () => {
      if (provinciaId) {
        try {
          const response = await axiosInstance.get<Ciudad[]>(`/ficha/ciudades?provinciaId=${provinciaId}`);
          setCiudadesFiltradas(response.data);
          setParroquiasFiltradas([]); // Resetear parroquias
          setValue("ciudadId", ""); // Resetear ciudad
          setValue("parroquiaId", ""); // Resetear parroquia
        } catch (error) {
          console.error("Error al cargar las ciudades:", error);
        }
      }
    };
    fetchCiudades();
  }, [provinciaId, setValue]);

  // Cuando cambia la ciudad, obtener las parroquias
  useEffect(() => {
    const fetchParroquias = async () => {
      if (ciudadId) {
        try {
          const response = await axiosInstance.get<Parroquia[]>(`/ficha/parroquias?ciudadId=${ciudadId}`);
          setParroquiasFiltradas(response.data);
          setValue("parroquiaId", ""); // Resetear parroquia
        } catch (error) {
          console.error("Error al cargar las parroquias:", error);
        }
      }
    };
    fetchParroquias();
  }, [ciudadId, setValue]);


  return (
    <Form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-8">
      {/* Sección 1: Información Personal */}
      <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-800">
        <h3 className="mb-4 text-lg font-semibold">Información Personal</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <Label>Nombres</Label>
            <p className="px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-900 dark:text-white">{getValues("nombres") || "-"}</p>
          </div>
          <div>
            <Label>Cédula</Label>
            <p className="px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-900 dark:text-white">{getValues("cedula") || "-"}</p>
          </div>
          <div>
            <Label>Fecha de Nacimiento</Label>
            <p className="px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-900 dark:text-white">{getValues("fechaNacimiento") || "-"}</p>
          </div>
          <div>
            <Label>Sexo</Label>
            <p className="px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-900 dark:text-white">{generoLabels[getValues("genero") || ""] || "-"}</p>
          </div>
          <div>
            <Label>Estado Civil <span className="text-error-500">*</span></Label>
            <Select
              options={[
                { value: "SOL", label: "Soltero/a" },
                { value: "UNL", label: "Unión Libre" },
                { value: "CAS", label: "Casado/a" },
                { value: "DIV", label: "Divorciado/a" },
                { value: "VIU", label: "Viudo/a" }
              ]}
              value={getValues("estadoCivil") || ""}
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
            <Label>Pais de Origen <span className="text-error-500">*</span></Label>
            <Select
              options={[
                { value: "593", label: "ECUADOR" },
                { value: "58", label: "VENEZUELA" },
                { value: "57", label: "COLOMBIA" },
                { value: "53", label: "CUBA" },
                { value: "1", label: "ESTADOS UNIDOS" },
                { value: "34", label: "ESPAÑA" },
                { value: "51", label: "PERU" },
                { value: "52", label: "MEXICO" },
                { value: "39", label: "ITALIA" },
                { value: "504", label: "HONDURAS" },
                { value: "506", label: "COSTA RICA" },
                { value: "507", label: "PANAMA" },
                { value: "509", label: "HAITÍ" },
                { value: "54", label: "ARGENTINA" },
                { value: "55", label: "BRASIL" },
                { value: "56", label: "CHILE" },
                { value: "591", label: "BOLIVIA" },
                { value: "809", label: "REPUBLICA DOMINICANA" },
                { value: "973", label: "BANRAIN" },
                { value: "41", label: "SUIZA" },
                { value: "43", label: "AUSTRIA" },
                { value: "49", label: "ALEMANIA" },
                { value: "514", label: "CANADA" },
                { value: "82", label: "COREA" },
                { value: "380", label: "UKRANIA" },
              ]}
              onChange={(value) => setValue("nacionalidad", value)}
              placeholder="Seleccione su nacionalidad"
              value={getValues("nacionalidad")}
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
              value={getValues("etnia") || ""}
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
                onChange={(value) => {
                  const parsedValue = parseInt(value);
                  // Si parseInt no retorna un número válido, asigna el valor por defecto o null.
                  setValue("indigenaNacionalidad", isNaN(parsedValue) ? 34 : parsedValue);  // 34 es el valor por defecto
                }}
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
            <AsyncSelect
              value={watch("colegio") || ""}
              onChange={(value) => setValue("colegio", value)}
              tipo="publico"
              setTipoColegio={(tipo) => setValue("tipoColegio", tipo.value)}
            />
            {errors.colegio && (
              <p className="mt-1 text-sm text-error-500">{errors.colegio.message}</p>
            )}
          </div>
          <div>
            <Label>Tipo de Colegio <span className="text-error-500">*</span></Label>
            <Select
              value={watch("tipoColegio") || ""}
              options={tipoColegioOptions}
              onChange={(value) => setValue("tipoColegio", value)}
              placeholder="Seleccione el tipo de colegio"
              disabled={true}
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
            <select
              {...register("carrera")}
              className={`w-full rounded-md border px-3 py-2 ${errors.carrera ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value={defaultData.carrera.id || ""}>{defaultData.carrera.nombre || "" }</option>
            </select>
            {errors.carrera && (
              <p className="text-error-500 text-sm mt-1">{errors.carrera.message}</p>
            )}
          </div>
          <div>
            <Label>Semestre <span className="text-error-500">*</span></Label>
            <select
              {...register("semestre")}
              className={`w-full rounded-md border px-3 py-2 ${errors.semestre ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Seleccione un semestre</option>
              {[...Array(9)].map((_, i) => (
                <option key={i + 1} value={i + 1}>{`Semestre ${i + 1}`}</option>
              ))}
            </select>
            {errors.semestre && (
              <p className="text-error-500 text-sm mt-1">{errors.semestre.message}</p>
            )}
          </div>
          <div>
            <Label>Tipo de Beca</Label>
            <p>{watch("beca") || "No tiene beca"}</p>
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
            >
              <option value="">Seleccione una provincia</option>
              {provincias.map((provincia: any) => (
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
            <Label>Canton <span className="text-error-500">*</span></Label>
            <select
              className={`w-full rounded-md border px-3 py-2 ${errors.ciudadId ? 'border-red-500' : 'border-gray-300'}`}
              {...register("ciudadId")}
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
            <select
              {...register("ingresosFamiliares")}
              className={`w-full rounded-md border px-3 py-2 ${errors.ingresosFamiliares  ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Seleccione un rango</option>
              <option value="Menos de $100">Menos de $100</option>
              <option value="$100 - $300">$100 - $300</option>
              <option value="$301 - $600">$301 - $600</option>
              <option value="$601 - $1000">$601 - $1000</option>
              <option value="Más de $1000">Más de $1000</option>
            </select>
          </div>
          <div>
            <Label>Gastos Mensuales <span className="text-error-500">*</span></Label>
            <select
              {...register("gastosMensuales")}
              className={`w-full rounded-md border px-3 py-2 ${errors.gastosMensuales ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Seleccione un rango</option>
              <option value="Menos de $100">Menos de $100</option>
              <option value="$100 - $300">$100 - $300</option>
              <option value="$301 - $600">$301 - $600</option>
              <option value="$601 - $1000">$601 - $1000</option>
              <option value="Más de $1000">Más de $1000</option>
            </select>
          </div>
          <div>
            <Label>Gastos en Vivienda <span className="text-error-500">*</span></Label>
            <select
              {...register("vivienda")}
              className={`w-full rounded-md border px-3 py-2 ${errors.vivienda ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Seleccione un rango</option>
              <option value="Menos de $100">Menos de $100</option>
              <option value="$100 - $300">$100 - $300</option>
              <option value="$301 - $600">$301 - $600</option>
              <option value="$601 - $1000">$601 - $1000</option>
              <option value="Más de $1000">Más de $1000</option>
            </select>
          </div>
          <div>
            <Label>Gastos en Transporte <span className="text-error-500">*</span></Label>
            <select
              {...register("transporte")}
              className={`w-full rounded-md border px-3 py-2 ${errors.transporte ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Seleccione un rango</option>
              <option value="Menos de $100">Menos de $100</option>
              <option value="$100 - $300">$100 - $300</option>
              <option value="$301 - $600">$301 - $600</option>
              <option value="$601 - $1000">$601 - $1000</option>
              <option value="Más de $1000">Más de $1000</option>
            </select>
          </div>
          <div>
            <Label>Gastos en Alimentación <span className="text-error-500">*</span></Label>
            <select
              {...register("alimentacion")}
              className={`w-full rounded-md border px-3 py-2 ${errors.alimentacion ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Seleccione un rango</option>
              <option value="Menos de $100">Menos de $100</option>
              <option value="$100 - $300">$100 - $300</option>
              <option value="$301 - $600">$301 - $600</option>
              <option value="$601 - $1000">$601 - $1000</option>
              <option value="Más de $1000">Más de $1000</option>
            </select>
          </div>
          <div>
            <Label>Otros Gastos <span className="text-error-500">*</span></Label>
            <select
              {...register("otrosGastos")}
              className={`w-full rounded-md border px-3 py-2 ${errors.otrosGastos ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Seleccione un rango</option>
              <option value="Menos de $100">Menos de $100</option>
              <option value="$100 - $300">$100 - $300</option>
              <option value="$301 - $600">$301 - $600</option>
              <option value="$601 - $1000">$601 - $1000</option>
              <option value="Más de $1000">Más de $1000</option>
            </select>
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
                <select
                  {...register("laboral.sueldo")}
                  className={`w-full rounded-md border px-3 py-2 ${!!(errors.laboral as any)?.sueldo ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Seleccione un rango</option>
                  <option value="Menos de $500">Menos de $500</option>
                  <option value="$500 - $1000">$500 - $1000</option>
                  <option value="$1001 - $2000">$1001 - $2000</option>
                  <option value="$2001 - $3000">$2001 - $3000</option>
                  <option value="Más de $3000">Más de $3000</option>
                </select>
                {errors.laboral && (errors.laboral as any).sueldo && (
                  <p className="text-error-500 text-sm mt-1">{(errors.laboral as any).sueldo?.message}</p>
                )}
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
                { value: "otro", label: "Otro Familiar" }
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
          {(estadoCivil === "CAS" || estadoCivil === "UNL") && (
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
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <Label>
                Su casa es <span className="text-error-500">*</span>
              </Label>
              <Select
                options={[
                  { value: 'propia', label: 'Propia con servicios basicos' },
                  { value: 'arrendada', label: 'Arrendada' },
                  { value: 'familiar', label: 'De un familiar' },
                  { value: 'prestada', label: 'Prestada' },
                ]}
                onChange={(value) => setValue('tipoCasa', value as 'propia' | 'arrendada' | 'familiar' | 'prestada', { shouldValidate: true })}
                placeholder="Seleccione su tipo de casa"
              />
            </div>
            <div>
              <Label>
                Estado Familiar <span className="text-error-500">*</span>
              </Label>
            <Select
              options={[
                { value: 'cabezaHogar', label: 'Cabeza de hogar' },
                { value: 'vivePadres', label: 'Vive con sus padres' },
                { value: 'independiente', label: 'Independiente' },
                { value: 'otro', label: 'Otro Familiar' },
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
                      <select
                        {...register(`miembros.${index}.edad`)}
                        className={`w-full rounded-md border px-3 py-2 ${
                          errors.miembros?.[index]?.edad ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Seleccione una edad</option>
                        <option value="<5>">0 - 5 años</option>
                        <option value="<12">6 - 12 años</option>
                        <option value="<17">13 - 17 años</option>
                        <option value="<25">18 - 25 años</option>
                        <option value="<35">26 - 35 años</option>
                        <option value="<45">36 - 45 años</option>
                        <option value="<60">46 - 60 años</option>
                        <option value=">60">Más de 60 años</option>
                      </select>
                      {errors.miembros?.[index]?.edad && (
                        <p className="text-error-500 text-sm mt-1">
                          {errors.miembros?.[index]?.edad?.message}
                        </p>
                      )}
                    </div>

                    {/* Sueldo */}
                    <div>
                      <Label>
                        Sueldo <span className="text-error-500">*</span>
                      </Label>
                      <select
                        {...register(`miembros.${index}.sueldo`)}
                        className={`w-full rounded-md border px-3 py-2 ${
                          errors.miembros?.[index]?.sueldo ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Seleccione un rango</option>
                        <option value="Menos de $500">Menos de $500</option>
                        <option value="$500 - $1000">$500 - $1000</option>
                        <option value="$1001 - $2000">$1001 - $2000</option>
                        <option value="$2001 - $3000">$2001 - $3000</option>
                        <option value="Más de $3000">Más de $3000</option>
                      </select>
                      {errors.miembros?.[index]?.sueldo && (
                        <p className="text-error-500 text-sm mt-1">
                          {errors.miembros?.[index]?.sueldo?.message}
                        </p>
                      )}
                    </div>

                    {/* Ocupación */}
                    <div>
                      <Label>Instrucción académica <span className="text-error-500">*</span></Label>
                      <Select
                        options={[
                          { value: '1', label: 'NINGUNO' },
                          { value: '2', label: 'CENTRO ALFABETIZACION' },
                          { value: '3', label: 'JARDIN INFANTES' },
                          { value: '4', label: 'EDUCACION BASICA' },
                          { value: '5', label: 'EDUCACION MEDIA' },
                          { value: '6', label: 'SUPERIOR NO UNIVERSITARIA COMPLETA' },
                          { value: '7', label: 'SUPERIOR NO UNIVERSITARIA INCOMPLETA' },
                          { value: '8', label: 'SUPERIOR UNIVERSITARIA COMPLETA' },
                          { value: '9', label: 'SUPERIOR UNIVERSITARIA INCOMPLETA' },
                          { value: '10', label: 'DIPLOMADO' },
                          { value: '11', label: 'ESPECIALIDAD' },
                          { value: '12', label: 'POSGRADO MAESTRIA' },
                          { value: '13', label: 'POSGRADO ESPECIALIDAD AREA SALUD' },
                          { value: '14', label: 'POSGRADO PHD' },
                          { value: '15', label: 'NO SABE' },
                          { value: '16', label: 'NO REGISTRA' },
                        ]}
                        onChange={(value) => setValue(`miembros.${index}.ocupacion`, value)}
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
                onClick={() => append({ sueldo: '', edad: '', parentesco: 'otro', ocupacion: 'otro' })}
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