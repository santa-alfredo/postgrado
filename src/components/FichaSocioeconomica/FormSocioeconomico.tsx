import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
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
import ColegioAsyncSelect from "../ficha/AsyncSelect";
import Swal from 'sweetalert2';



// Esquema de validación con Zod
const formSchema = z.object({
  // Información Personal
  nombres: z.string()
    .min(2, "Los nombres deben tener al menos 2 caracteres")
    .max(50, "Los nombres no pueden exceder 50 caracteres")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "Los nombres solo pueden contener letras y espacios"),

  cedula: z.string()
    .min(10, "La cédula debe tener al menos 10 dígitos")
    .max(13, "La cédula no puede exceder 13 dígitos")
    .regex(/^\d+$/, "La cédula solo puede contener números"),
  fechaNacimiento: z.string()
    .min(1, "La fecha de nacimiento es requerida"),
  genero: z.string()
    .min(1, "El género es requerido"),

  generoIdentidad: z.string()
    .min(1, "El sexo es requerido"),
  otroSexo: z.string().optional(),
  
  orientacionSexual: z.string()
    .min(1, "El género es requerido"),
  otroOrientacionSexual: z.string().optional(),
  
  estadoCivil: z.string()
    .min(1, "El estado civil es requerido"),
  telefono: z.string()
    .regex(/^\d{10}$/, "El teléfono debe tener exactamente 10 dígitos numéricos, no espacios en blanco"),
  email: z.string()
    .email("Debe ser un correo electrónico válido"),
  nacionalidad: z.string()
    .min(1, "La nacionalidad es requerida"),
  etnia: z.enum(["MET", "IND", "BLA", "AFR", "MON", "MUL", "NEG", "OTR", "NIN"], { required_error: "La etnia es requerida" }),
  indigenaNacionalidad: z.string().min(1, "La nacionalidad indigena es requerida"),

  cambioResidencia: z.enum(["S", "N"], { required_error: "El cambio de residencia es requerido" }),
  direccion: z.string()
    .min(10, "La dirección debe tener al menos 10 caracteres")
    .max(100, "La dirección no puede exceder 100 caracteres"),
  
  pais: z.object({
      value: z.string(),
      label: z.string().min(1, "Debe seleccionar un país "),
    }).nullable(),

  provincia: z.object({
    value: z.string(),
    label: z.string().min(1, "Debe seleccionar una provincia "),
  }).nullable(),
  
  ciudad: z.object({
    value: z.string(),
    label: z.string().min(1, "Debe seleccionar una provincia"),
  }).nullable(),
  
  parroquia: z.object({
    value: z.string(),
    label: z.string().min(1, "Debe seleccionar una provincia"),
  }).nullable(),

  // Información Académica
  carrera: z.string()
    .min(1, "Seleccione una carrera"),

  colegio: z.object({
    value: z.string(),
    label: z.string().min(1, "Debe seleccionar un colegio y si no encuentra su colegio comunicarse con admisiones"),
    tipoValue: z.string().optional(),
    tipoLabel: z.string().optional(),
  }).nullable(),

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
      .max(50, "La carrera no puede exceder 50 caracteres"),
    razon: z.string()
      .min(2, "La razón debe tener al menos 2 caracteres")
      .max(100, "La razón no puede exceder 100 caracteres"),
  }).optional(),

  beca: z.string().nullable().optional(),
  internet: z.enum(["S", "N", ""], { required_error: "La conexión a internet es requerida" }),
  computadora: z.enum(["S", "N",""], { required_error: "La computadora es requerida" }),

  // Información Laboral
  situacionLaboral: z.enum(["EMPLEADO", "DESEMPLEADO", "NEGOCIO", "PENSIONADO", "OTRO"], { required_error: "La situación laboral es requerida" }),
  laboral: z.discriminatedUnion("tipo",
    [
      z.object({
        tipo: z.literal("EMPLEADO"),
        empresa: z.string()
          .min(2, "La empresa debe tener al menos 2 caracteres")
          .max(100, "La empresa no puede exceder 100 caracteres"),
        cargo: z.string()
          .min(2, "El cargo debe tener al menos 2 caracteres")
          .max(100, "El cargo no puede exceder 100 caracteres"),
          sueldo: z.string().min(1, "El sueldo es requerido"),
      }),
      z.object({
        tipo: z.literal("NEGOCIO"),
        negocio: z.string()
          .min(2, "El negocio debe tener al menos 2 caracteres")
          .max(100, "El negocio no puede exceder 100 caracteres"),
        actividades: z.string()
          .min(2, "Las actividades deben tener al menos 2 caracteres")
          .max(100, "Las actividades no pueden exceder 100 caracteres"),
      }),
      z.object({
        tipo: z.literal('PENSIONADO'),
        fuente: z
          .string()
          .min(2, 'La fuente de la pensión debe tener al menos 2 caracteres')
          .max(100, 'La fuente no puede exceder 100 caracteres'),
        monto: z
          .number({ invalid_type_error: 'El monto debe ser un número' })
          .min(0, 'El monto no puede ser negativo'),
      }),
      z.object({
        tipo: z.literal('OTRO'),
        descripcion: z
          .string()
          .min(2, 'La descripción debe tener al menos 2 caracteres')
          .max(100, 'La descripción no puede exceder 100 caracteres'),
      }),
      z.object({
        tipo: z.literal('DESEMPLEADO'),
        dependiente: z.enum(["PADRE", "MADRE", "HERMANO", "OTRO"], { required_error: "El dependiente es requerido" }),
      }),
    ]
  ).optional(),

  // Relaciones Personales
  relacionCompa: z.enum(["MUY BUENA", "BUENA", "REGULAR", "MALA"], { required_error: "La relación con compañeros es requerida" }),
  integracionUmet: z.enum(["S", "N"], { required_error: "La integración en UMET es requerida" }),
  relacionDocente: z.enum(["MUY BUENA", "BUENA", "REGULAR", "MALA"], { required_error: "La relación con el docente es requerida" }),
  relacionPadres: z.enum(["MUY BUENA", "BUENA", "REGULAR", "MALA"], { required_error: "La relación con los padres es requerida" }),
  relacionPareja: z.enum(["MUY BUENA", "BUENA", "REGULAR", "MALA"], { required_error: "La relación con la pareja es requerida" }).optional(),

  // Familia
  estadoFamiliar: z.enum(["CABEZAHOGAR", "FAMILIA", "INDEPENDIENTE"], { required_error: "El estado familiar es requerido" }),
  tipoCasa: z.string().min(1, "El tipo de casa es requerido"),
  origenRecursos: z.string().min(1, "El tipo de origen de recurso es requerido"),
  origenEstudios: z.string().min(1, "El tipo de origen de recurso es requerido"),
  miembros: z
    .array(
      z.object({
        sueldo: z.string().min(1, "El sueldo es requerido"),
        edad: z.string().min(1, "La edad es requerida"),
        parentesco: z.enum(["HIJO", "PADRE", "MADRE", "HERMANO", "CONYUGE", "OTRO"], { required_error: "El parentesco es requerido" }),
        ocupacion: z.string().min(1, "La Instrucción Académica es requerida"),
      })
    )
    .optional(),

  // Salud
  tieneDiscapacidad: z.enum(["S", "N"], { required_error: "La discapacidad es requerida" }),
  discapacidad: z.object({
    tipo: z.enum(["FISICA", "PSIQUICA", "AUDITIVA", "VISUAL", "INTELECTUAL", "MULTIPLE"], { required_error: "El tipo de discapacidad es requerido" }),
    porcentaje: z.number().int().min(30, "El porcentaje de discapacidad debe ser al menos 30%").max(100, "El porcentaje de discapacidad no puede exceder 100%"),
    tieneDiagnosticoPresuntivo: z.enum(["SI", "NO"], { required_error: "El diagnóstico presuntivo es requerido" }),
    carnet: z.string().min(1, "El carnet de discapacidad es requerido"),
  }).optional(),

  tieneEnfermedadCronica: z.enum(["S", "N"], { required_error: "La enfermedad crónica es requerida" }),
  enfermedadCronica: z.object({
    nombre: z.string().min(1, "El nombre de la enfermedad es requerido"),
    lugaresTratamiento: z.string().min(1, "El carnet de discapacidad es requerido"),
  }).optional(),

  contactoParentesco: z.string().min(1, "El parentesco es requerido"),
  contactoNombre: z.string().min(1, "Nombre de la Persona de Contacto"),
  contactoCelular: z.string()
  .regex(/^\d{10}$/, "El teléfono debe tener exactamente 10 dígitos numéricos, no espacios en blanco"),

  // Documentos
  // documentos: z.instanceof(FileList)
  //   .refine((files) => files.length > 0, "Debe subir al menos un documento")
})

type FormData = z.infer<typeof formSchema>;

const nacionalidadesIndigenas = [
  { value: "1", label: "Tsáchila" },
  { value: "2", label: "Waorani" },
  { value: "3", label: "Zápara" },
  { value: "4", label: "Andoa" },
  { value: "5", label: "Kichwa" },
  { value: "6", label: "Pastos" },
  { value: "7", label: "Natabuela" },
  { value: "8", label: "Otavalo" },
  { value: "9", label: "Karanki" },
  { value: "10", label: "Kayambi" },
  { value: "11", label: "Kitukara" },
  { value: "12", label: "Panzaleo" },
  { value: "13", label: "Chibuleo" },
  { value: "14", label: "Salasaka" },
  { value: "15", label: "Kisapincha" },
  { value: "16", label: "Tomabela" },
  { value: "17", label: "Waranka" },
  { value: "18", label: "Puruha" },
  { value: "19", label: "Kañari" },
  { value: "20", label: "Saraguro" },
  { value: "21", label: "Paltas" },
  { value: "22", label: "Manta" },
  { value: "23", label: "Huancavilca" },
  { value: "24", label: "Achuar" },
  { value: "25", label: "Awá" },
  { value: "26", label: "Al Cofán" },
  { value: "27", label: "Chachi" },
  { value: "28", label: "Épera" },
  { value: "29", label: "Huaorani" },
  { value: "30", label: "Secoya" },
  { value: "31", label: "Shuar" },
  { value: "32", label: "Siona" },
  { value: "33", label: "Shiwiar" },
  { value: "34", label: "No Registra" },
];



type Props = {
  onSuccess: (data: FichaSocioeconomica) => void;
  defaultData: FichaSocioeconomica;
};

interface Seleccione {
  value: string;
  label: string;
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
      nombres: defaultData.nombres || "",
      cedula: defaultData.cedula || "",
      fechaNacimiento: defaultData.fechaNacimiento || "",
      genero: defaultData.genero || "",
      estadoCivil: defaultData.estadoCivil || "",
      email: defaultData.email || "",
      nacionalidad: defaultData.nacionalidad || "",
      telefono: defaultData.telefono || "",
      colegio: defaultData.colegio ?? null,
      indigenaNacionalidad: defaultData.indigenaNacionalidad || "34",
      beca: defaultData.beca || "N",
      carrera: defaultData.carrera.nombre || "",
      promedio: defaultData.promedio || 0,
      direccion: defaultData.direccion || "",
      etnia: defaultData.etnia || "MET",
      anioGraduacion: defaultData.anioGraduacion || 2000,
      semestre: defaultData.semestre || "",
      pais: defaultData.pais ?? undefined,
      provincia: defaultData.provincia ?? undefined,
      ciudad: defaultData.ciudad ?? undefined,
      parroquia: defaultData.parroquia ?? undefined,
      tipoCasa: defaultData.tipoCasa ?? "",
      internet: defaultData.internet ?? "",
      computadora: defaultData.computadora ?? "",
      origenRecursos: defaultData.origenRecursos ?? "",
      origenEstudios: defaultData.origenEstudios ?? "",
      relacionCompa: defaultData.relacionCompa || undefined,
      integracionUmet: defaultData.integracionUmet || undefined,
      relacionDocente: defaultData.relacionDocente || undefined,
      relacionPadres: defaultData.relacionPadres || undefined,
      relacionPareja: defaultData.relacionPareja || undefined,

      situacionLaboral: undefined,
      laboral: undefined,
      estadoFamiliar: undefined,
      miembros: [],
      estudioOtraUniversidad: false,
      otraUniversidad: undefined,
      discapacidad: undefined,
      enfermedadCronica: undefined,
      cambioResidencia: 'N'
    }
  });

  // const { suggestions, checkSpelling } = useSpellcheck();
  // const { suggestions, setSuggestions, checkSpelling } = useSpellcheck();
  const estudioOtraUniversidad = useWatch({ control, name: "estudioOtraUniversidad" });
  const situacionLaboral = useWatch({ control, name: 'situacionLaboral' });
  const estadoCivil = useWatch({ control, name: 'estadoCivil' });
  const estadoFamiliar = useWatch({ control, name: 'estadoFamiliar' });
  const etniaSeleccionada  = useWatch({ control, name: 'etnia' });
  const sexo = watch("generoIdentidad");
  const orientacionSexual = watch("orientacionSexual")

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'miembros',
  });
  const tieneDiscapacidad = useWatch({ control, name: 'tieneDiscapacidad' });
  const tieneEnfermedadCronica = useWatch({ control, name: 'tieneEnfermedadCronica' });

  const onSubmit = async (data: FormData) => {
    console.log(data);

    if (!editDireccion) {
      data.pais = null;
      data.provincia = null;
      data.ciudad = null;
      data.parroquia = null;
    }
  
    // Mostrar mensaje de carga
    Swal.fire({
      title: 'Enviando...',
      text: 'Por favor espera mientras se guarda la información.',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
    // Aquí se enviaría la información al backend
    try {
      const response = await axiosInstance.post(`/ficha/ficha-socioeconomica`, data);
      // Cerrar el loading
      Swal.close();

      const result = response.data as { ficha: FichaSocioeconomica };
      onSuccess(result.ficha);
    } catch (error: any) {
      Swal.close(); // Cierra el loading si hay error
      if (error.response) {
        console.error("Error del backend:", error.response.data);
        // El servidor respondió con un código diferente a 2xx
        Swal.fire({
          icon: 'error',
          title: 'Error del servidor',
          text: error.response?.data?.detail || 'Ocurrió un error inesperado.',
        });
        // Aquí puedes mostrar error.response.data.detail al usuario si es un 422 de FastAPI
      } else if (error.request) {
        // La solicitud fue hecha pero no se recibió respuesta
        console.error("No se recibió respuesta del servidor:", error.request);
        Swal.fire({
          icon: 'warning',
          title: 'Sin respuesta',
          text: 'No se recibió respuesta del servidor.',
        });
      } else {
        // Ocurrió un error al configurar la solicitud
        console.error("Error al configurar la solicitud:", error.message);
        Swal.fire({
          icon: 'error',
          title: 'Error de configuración',
          text: error.message,
        });
      }
      // mostrar error al usuario si deseas
    }
  };
  const onError = (errors: any) => {
    console.log(errors);
    const mensajes = Object.values(errors)
      .map((err: any) => err.message)
      .join("\n");
    Swal.fire({
      icon: 'error',
      title: 'Errores de validación',
      html: mensajes,
    });
  };

  // Limpiar campos de laboral cuando cambia situacionLaboral
  const handleSituacionLaboralChange = (value: string) => {
    setValue('situacionLaboral', value as 'EMPLEADO' | 'NEGOCIO' | 'DESEMPLEADO' | 'PENSIONADO' | 'OTRO', { shouldValidate: true });
    if (value === 'DESEMPLEADO') {
      setValue('laboral', undefined, { shouldValidate: true });
    } else {
      switch (value) {
        case 'EMPLEADO':
          setValue('laboral', { tipo: 'EMPLEADO', empresa: '', cargo: '', sueldo: "" }, { shouldValidate: true });
          break;
        case 'NEGOCIO':
          setValue('laboral', { tipo: 'NEGOCIO', negocio: '', actividades: '' }, { shouldValidate: true });
          break;
        case 'PENSIONADO':
          setValue('laboral', { tipo: 'PENSIONADO', fuente: '', monto: 0 }, { shouldValidate: true });
          break;
        case 'OTRO':
          setValue('laboral', { tipo: 'OTRO', descripcion: '' }, { shouldValidate: true });
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

  const [editandoColegio, setEditandoColegio] = useState(false);
  const [editDireccion, setEditDireccion] = useState(false);
   // Cuando cambia la provincia, obtener las ciudades
   const [paises, setPais] = useState<Seleccione[]>([]);
   const [provincias, setProvincias] = useState<Seleccione[]>([]);
  const [ciudadesFiltradas, setCiudadesFiltradas] = useState<Seleccione[]>([]);
  const [parroquiasFiltradas, setParroquiasFiltradas] = useState<Seleccione[]>([]);

  const pais = watch("pais");
  const provincia = watch("provincia");
  const ciudad = watch("ciudad");
  const parroquia = watch("parroquia");
  const colegioSeleccionado = watch("colegio");

  // Cargar Paises (solo una vez al principio)
  useEffect(() => {
    if (!pais?.label){
      setEditDireccion(true)
    }
    if(!colegioSeleccionado?.label){
      setEditandoColegio(true)
    }
    const fetchPais = async () => {
      try {
        const response = await axiosInstance.get<Seleccione[]>(`/ficha/paises`);
        setPais(response.data);
      } catch (error) {
        console.error("Error al cargar los paises:", error);
      }
    };
    fetchPais();
  }, []);  // Este useEffect solo se ejecuta una vez cuando el componente se monta.

  // Cargar Provincias (solo una vez al principio)
  useEffect(() => {
    const fetchProvincias = async () => {
      try {
        const response = await axiosInstance.get<Seleccione[]>(`/ficha/provincias?paisId=${pais?.value}`);
        setProvincias(response.data);
      } catch (error) {
        console.error("Error al cargar las provincias:", error);
      }
    };
    if (pais?.value && pais?.label) {
      fetchProvincias();
    }
  }, [pais, setValue]);  // Este useEffect solo se ejecuta una vez cuando el componente se monta.

  // Cuando cambia la provincia, obtener las ciudades (y evitar llamada si provincia ya tiene label)
  useEffect(() => {
    const fetchCiudades = async () => {
      // Solo hacemos la llamada al backend si la provincia no tiene un label ya cargado
      if (provincia?.value && editDireccion) {
        try {
          const response = await axiosInstance.get<Seleccione[]>(`/ficha/ciudades?provinciaId=${provincia?.value}`);
          setCiudadesFiltradas(response.data);
          setParroquiasFiltradas([]); // Resetear parroquias
          setValue("ciudad", null); // Resetear ciudad
          setValue("parroquia", null); // Resetear parroquia
        } catch (error) {
          console.error("Error al cargar las ciudades:", error);
        }
      }
    };

    // Solo se ejecuta si la provincia cambia o se establece un valor
    if (provincia?.value && provincia?.label) {
      // Si ya tienes la provincia con label, no haces la llamada al backend
      fetchCiudades();
    }
  }, [provincia, setValue, editDireccion]);  // Se ejecuta cuando `provincia` cambia

  // Cuando cambia la ciudad, obtener las parroquias
  useEffect(() => {
    const fetchParroquias = async () => {
      if (ciudad?.value && editDireccion) {
        try {
          const response = await axiosInstance.get<Seleccione[]>(`/ficha/parroquias?ciudadId=${ciudad?.value}`);
          setParroquiasFiltradas(response.data);
          setValue("parroquia", null); // Resetear parroquia
        } catch (error) {
          console.error("Error al cargar las parroquias:", error);
        }
      }
    };

    // Solo ejecuta si ciudad está definida
    fetchParroquias();
  }, [ciudad, setValue, editDireccion]);  // Se ejecuta cuando `ciudad` cambia

  // Solo activar edición si no hay colegio en el primer render
  useEffect(() => {
    if (!defaultData.colegio) {
      setEditandoColegio(true);
    }
  }, [defaultData.colegio]);

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
            {getValues("fechaNacimiento") === "" ? (
              <input
                type="date"
                className="w-full rounded-md border border-gray-300 p-2 text-sm"
                {...register("fechaNacimiento")}
              />
            ) : (
              <p className="px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-900 dark:text-white">
                {getValues("fechaNacimiento")}
              </p>
            )}

            {errors.fechaNacimiento && (
              <p className="mt-1 text-sm text-error-500">{errors.fechaNacimiento.message}</p>
            )}
          </div>
          <div>
            <Label>Sexo <span className="text-error-500">*</span></Label>
            <select
              {...register(`genero`)}
              disabled={!!defaultData.genero}
              className={`w-full rounded-md border px-3 py-2 ${
                errors.genero ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="" disabled>Seleccione su sexo</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
            </select>
            {errors.genero && (
              <p className="text-error-500 text-sm mt-1">
                {errors.genero?.message}
              </p>
            )}
          </div>
          <div>
            <Label>Identidad de género</Label>
            <Select
              options={[
                { value: "H", label: "Hombre" },
                { value: "M", label: "Mujer" },
                { value: "PB", label: "Persona no binaria" },
                { value: "O", label: "Otro" },
                { value: "N", label: "Prefiero no responder" },
              ]}
              value={sexo}
              onChange={(value) => setValue("generoIdentidad", value)}
              placeholder="Seleccione su genero"
            />
            {errors.generoIdentidad && (
              <p className="mt-1 text-sm text-error-500">{errors.generoIdentidad.message}</p>
            )}
            {sexo === "O" && (
              <div className="mt-4">
               <Label>Especifique el otro identidad de género <span className="text-error-500">*</span></Label>
              <Input
                register={register("otroSexo")}
                error={!!errors.otroSexo}
                hint={errors.otroSexo?.message}
              />
              </div>
            )}
          </div>
          <div>
            <Label>Orientación sexual</Label>
            <Select
              options={[
                { value: "HT", label: "Heterosexual" },
                { value: "HM", label: "Homosexual (gay o lesbiana)" },
                { value: "BS", label: "Bisexual" },
                { value: "O", label: "Otro" },
                { value: "N", label: "Prefiero no responder" },
              ]}
              value={orientacionSexual || ''}
              onChange={(value) => setValue("orientacionSexual", value)}
              placeholder="Seleccione su orientacion sexual"
            />
            {errors.orientacionSexual && (
              <p className="mt-1 text-sm text-error-500">{errors.orientacionSexual.message}</p>
            )}
            {orientacionSexual === "O" && (
              <div className="mt-4">
               <Label>Especifique la otra orientacion sexual <span className="text-error-500">*</span></Label>
              <Input
                register={register("otroOrientacionSexual")}
                error={!!errors.otroOrientacionSexual}
                hint={errors.otroOrientacionSexual?.message}
              />
              </div>
            )}
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
                { value: "ECUADOR", label: "ECUADOR" },
                { value: "VENEZUELA", label: "VENEZUELA" },
                { value: "COLOMBIA", label: "COLOMBIA" },
                { value: "CUBA", label: "CUBA" },
                { value: "ESTADOS UNIDOS", label: "ESTADOS UNIDOS" },
                { value: "ESPAÑA", label: "ESPAÑA" },
                { value: "PERU", label: "PERU" },
                { value: "MEXICO", label: "MEXICO" },
                { value: "ITALIA", label: "ITALIA" },
                { value: "HONDURAS", label: "HONDURAS" },
                { value: "COSTA RICA", label: "COSTA RICA" },
                { value: "PANAMA", label: "PANAMA" },
                { value: "HAITI", label: "HAITÍ" },
                { value: "ARGENTINA", label: "ARGENTINA" },
                { value: "BRASIL", label: "BRASIL" },
                { value: "CHILE", label: "CHILE" },
                { value: "BOLIVIA", label: "BOLIVIA" },
                { value: "REPUBLICA DOMINICANA", label: "REPUBLICA DOMINICANA" },
                { value: "BANRAIN", label: "BANRAIN" },
                { value: "SUIZA", label: "SUIZA" },
                { value: "AUSTRIA", label: "AUSTRIA" },
                { value: "ALEMANIA", label: "ALEMANIA" },
                { value: "CANADA", label: "CANADA" },
                { value: "COREA", label: "COREA" },
                { value: "UKRANIA", label: "UKRANIA" },
              ]}
              onChange={(value) => setValue("nacionalidad", value)}
              placeholder="Seleccione su nacionalidad"
              value={watch("nacionalidad")}
            />
            {errors.nacionalidad && (
              <p className="mt-1 text-sm text-error-500">{errors.nacionalidad.message}</p>
            )}
          </div>
          <div>
            <Label>Reconocimiento étnico <span className="text-error-500">*</span></Label>
            <Select
              options={[
                { value: "MET", label: "Mestizo" },
                { value: "IND", label: "Indígena" },
                { value: "BLA", label: "Blanco" },
                { value: "AFR", label: "Afroecuatoriano/a" },
                { value: "MON", label: "Montubio" },
                { value: "MUL", label: "Mulatto" },
                { value: "NEG", label: "Negro" },
                { value: "OTR", label: "Otro" },
                { value: "NIN", label: "No Registra" },
              ]}
              onChange={(value) => setValue("etnia", value as "MET" | "IND" | "BLA" | "AFR" | "MON" | "MUL" | "NEG" | "OTR" | "NIN")}
              placeholder="Seleccione su etnia"
              value={getValues("etnia") || ""}
            />
            {errors.etnia && (
              <p className="mt-1 text-sm text-error-500">{errors.etnia.message}</p>
            )}
          </div>
          {etniaSeleccionada === "IND" && (
            <div>
              <Label>Nacionalidad Indígena <span className="text-error-500">*</span></Label>
              <Select
                options={nacionalidadesIndigenas.map(nacionalidad => ({ value: nacionalidad.value.toString(), label: nacionalidad.label }))}
                onChange={(value) => {
                  setValue("indigenaNacionalidad", value);  // 34 es el valor por defecto
                }}
                placeholder="Seleccione su nacionalidad indigena"
                value={watch("indigenaNacionalidad") || "34"}
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
        <div className="grid grid-cols-1">
            <Label>Colegio <span className="text-error-500">*</span></Label>
            {editandoColegio ? (
              <ColegioAsyncSelect
                value={watch("colegio") ?? null}
                onChange={(option) => setValue("colegio", option)}
              />
            ) :(
              <div className="flex items-center justify-between bg-gray-100 p-2 rounded-md">
                <span className="text-sm">
                  {colegioSeleccionado?.label}
                  {colegioSeleccionado?.tipoLabel && (
                    <span className="ml-2 text-xs text-gray-500">
                      ({colegioSeleccionado.tipoLabel})
                    </span>
                  )}
                </span>
                <button
                  type="button"
                  className="ml-2 text-blue-600 text-sm underline"
                  onClick={() => {
                    setEditandoColegio(true);
                  }}
                >
                  Cambiar
                </button>
              </div>
            )}
            {errors.colegio?.label && (
              <p className="mt-1 text-sm text-error-500">{errors.colegio.label.message}</p>
            )}
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
              <option value={defaultData.carrera.nombre|| ""}>{defaultData.carrera.nombre || "" }</option>
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
              {[...Array(2)].map((_, i) => (
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
            <select {...register("cambioResidencia")} className="w-full border rounded px-3 py-2">
              <option value="">Seleccione</option>
              <option value="S">Sí</option>
              <option value="N">No</option>
            </select>
            {errors.cambioResidencia && (
              <p className="mt-1 text-sm text-red-500">{errors.cambioResidencia.message}</p>
            )}
          </div>

          {editDireccion ? (
            <>
            {/* Select Pais */}
            <Controller
              control={control}
              name="pais"
              render={({ field }) => (
                <div>
                  <Label>
                    Pais <span className="text-error-500">*</span>
                  </Label>
                  <select
                    className={`w-full rounded-md border px-3 py-2 ${errors.pais ? 'border-red-500' : 'border-gray-300'}`}
                    value={field.value?.value || ""}
                    onChange={(e) => {
                      const selected = paises.find((p) => p.value === e.target.value);
                      field.onChange(selected ? { value: selected.value, label: selected.label } : null);
                    }}
                  >
                    <option value="">Seleccione un pais</option>
                    {paises.map((pais, index) => (
                      <option key={pais.value || index} value={pais.value}>
                        {pais.label}
                      </option>
                    ))}
                  </select>
                  {errors.pais?.label && (
                    <p className="mt-1 text-sm text-red-500">{errors.pais.label.message}</p>
                  )}
                </div>
              )}
            />

            {/* Select Provincia */}
            <Controller
              control={control}
              name="provincia"
              render={({ field }) => (
                <div>
                  <Label>
                    Provincia <span className="text-error-500">*</span>
                  </Label>
                  <select
                    className={`w-full rounded-md border px-3 py-2 ${errors.provincia ? 'border-red-500' : 'border-gray-300'}`}
                    value={field.value?.value || ""}
                    onChange={(e) => {
                      const selected = provincias.find((p) => p.value === e.target.value);
                      field.onChange(selected ? { value: selected.value, label: selected.label } : null);
                    }}
                  >
                    <option value="">Seleccione una provincia</option>
                    {provincias.map((provincia, index) => (
                      <option key={provincia.value || index} value={provincia.value}>
                        {provincia.label}
                      </option>
                    ))}
                  </select>
                  {errors.provincia?.label && (
                    <p className="mt-1 text-sm text-red-500">{errors.provincia.label.message}</p>
                  )}
                </div>
              )}
            />

            {/* Select Ciudad */}
            <Controller
              control={control}
              name="ciudad"
              render={({ field }) => (
                <div>
                  <Label>
                    Cantón <span className="text-error-500">*</span>
                  </Label>
                  <select
                    className={`w-full rounded-md border px-3 py-2 ${errors.ciudad ? 'border-red-500' : 'border-gray-300'}`}
                    value={field.value?.value || ""}
                    onChange={(e) => {
                      const selected = ciudadesFiltradas.find((c) => c.value === e.target.value);
                      field.onChange(selected ? { value: selected.value, label: selected.label } : null);
                    }}
                    disabled={!ciudadesFiltradas.length}
                  >
                    <option value="">Seleccione una ciudad</option>
                    {ciudadesFiltradas.map((ciudad) => (
                      <option key={ciudad.value} value={ciudad.value}>
                        {ciudad.label}
                      </option>
                    ))}
                  </select>
                  {errors.ciudad?.label && (
                    <p className="mt-1 text-sm text-red-500">{errors.ciudad.label.message}</p>
                  )}
                </div>
              )}
            />

            {/* Select Parroquia */}
            <Controller
              control={control}
              name="parroquia"
              render={({ field }) => (
                <div>
                  <Label>
                    Parroquia <span className="text-error-500">*</span>
                  </Label>
                  <select
                    className={`w-full rounded-md border px-3 py-2 ${errors.parroquia ? 'border-red-500' : 'border-gray-300'}`}
                    value={field.value?.value || ""}
                    onChange={(e) => {
                      const selected = parroquiasFiltradas.find((p) => p.value === e.target.value);
                      field.onChange(selected ? { value: selected.value, label: selected.label } : null);
                    }}
                    disabled={!parroquiasFiltradas.length}
                  >
                    <option value="">Seleccione una parroquia</option>
                    {parroquiasFiltradas.map((parroquia, index) => (
                      <option key={parroquia.value || index} value={parroquia.value}>
                        {parroquia.label}
                      </option>
                    ))}
                  </select>
                  {errors.parroquia?.label && (
                    <p className="mt-1 text-sm text-red-500">{errors.parroquia.label.message}</p>
                  )}
                </div>
              )}
            />
            </>
          ):(
            <div className="space-y-2">
              <div>
                <Label>País</Label>
                <p className="text-sm">{pais?.label}</p>
              </div>
              <div>
                <Label>Provincia</Label>
                <p className="text-sm">{provincia?.label}</p>
              </div>
              <div>
                <Label>Ciudad</Label>
                <p className="text-sm">{ciudad?.label}</p>
              </div>
              <div>
                <Label>Parroquia</Label>
                <p className="text-sm">{parroquia?.label}</p>
              </div>
              <button
                type="button"
                className="mt-2 text-blue-600 underline"
                onClick={() => setEditDireccion(true)}
              >
                Cambiar dirección
              </button>
            </div>
          )}
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
                { value: "EMPLEADO", label: "Empleado" },
                { value: "NEGOCIO", label: "Negocio propio" },
                { value: "DESEMPLEADO", label: "Desempleado" },
                { value: "PENSIONADO", label: "Pensionado" },
                { value: "OTRO", label: "Otro" }
              ]}
              onChange={(value) => {
                setValue('situacionLaboral', value as 'EMPLEADO' | 'NEGOCIO' | 'DESEMPLEADO' | 'PENSIONADO' | 'OTRO', { shouldValidate: true });
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
        {situacionLaboral === "EMPLEADO" && (
          <div>
            <div>
              <Label>Empresa <span className="text-error-500">*</span></Label>
              <Input
                register={register("laboral.empresa")}
                error={
                  errors.laboral?.type === "EMPLEADO" &&
                  "empresa" in errors.laboral &&
                  !!errors.laboral.empresa
                }
                hint={((errors.laboral as unknown) as FormData["laboral"] & { empresa?: { message?: string } })?.empresa?.message}
              />
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <Label>Cargo <span className="text-error-500">*</span></Label>
                <Input
                  register={register("laboral.cargo")}
                  error={
                    errors.laboral?.type === "EMPLEADO" &&
                    "cargo" in errors.laboral &&
                    !!errors.laboral.cargo
                  }
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
                  <option value="1">Menos de $470</option>
                  <option value="2">$470 - $1000</option>
                  <option value="3">Más de $1000</option>
                </select>
                {errors.laboral && (errors.laboral as any).sueldo && (
                  <p className="text-error-500 text-sm mt-1">{(errors.laboral as any).sueldo?.message}</p>
                )}
              </div>
            </div>
          </div>
        )}
        {situacionLaboral === "NEGOCIO" && (
          <div>
            <div>
              <Label>Nombre delNegocio <span className="text-error-500">*</span></Label>
              <Input
                register={register("laboral.negocio")}
                error={!!(errors.laboral as any)?.negocio}
                hint={(errors.laboral as any)?.negocio?.message}
              />
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

        {situacionLaboral === "PENSIONADO" && (
          <div>
            <Label>Fuente de la pensión <span className="text-error-500">*</span></Label>
            <Input
              register={register("laboral.fuente")}
              error={!!(errors.laboral as any)?.fuente}
              hint={(errors.laboral as any)?.fuente?.message}
            />
          </div>
        )}

        {situacionLaboral === "OTRO" && (
          <div>
            <Label>Descripción <span className="text-error-500">*</span></Label>
            <Input
              register={register("laboral.descripcion")}
              error={!!(errors.laboral as any)?.descripcion}
              hint={(errors.laboral as any)?.descripcion?.message}
            />
          </div>
        )}
        {situacionLaboral === "DESEMPLEADO" && (
          <div>
            <Label>Economicamente dependiente de <span className="text-error-500">*</span></Label>
            <Select
              options={[
                { value: "PADRE", label: "PADRE" },
                { value: "MADRE", label: "MADRE" },
                { value: "HERMANO", label: "HERMANO" },
                { value: "OTRO", label: "OTRO FAMILIAR" }
              ]}
              onChange={(value) => {
                setValue('laboral.tipo', 'DESEMPLEADO', { shouldValidate: true });
                setValue('laboral.dependiente', value as 'PADRE' | 'MADRE' | 'HERMANO' | 'OTRO', { shouldValidate: true });
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
                { value: "MUY BUENA", label: "MUY BUENA" },
                { value: "BUENA", label: "BUENA" },
                { value: "REGULAR", label: "REGULAR" },
                { value: "MALA", label: "MALA" }
              ]}
              onChange={(value) => setValue("relacionCompa", value as "MUY BUENA" | "BUENA" | "REGULAR" | "MALA")}
              placeholder="Seleccione su relación con compañeros"
              defaultValue={getValues('relacionCompa')}
            />
            {errors.relacionCompa && (
              <p className="mt-1 text-sm text-error-500">{errors.relacionCompa.message}</p>
            )}
          </div>
          <div>
            <Label> Se siente integrado en UMET <span className="text-error-500">*</span></Label>
            <Select
              options={[
                { value: "S", label: "Si" },
                { value: "N", label: "No" }
              ]}
              defaultValue={getValues('integracionUmet')}
              onChange={(value) => setValue("integracionUmet", value as "S" | "N")}
              placeholder="Seleccione si se siente integrado en UMET"
            />
            {errors.integracionUmet && (
              <p className="mt-1 text-sm text-error-500">{errors.integracionUmet.message}</p>
            )}
          </div>
          <div>
            <Label>Relacion con el docente <span className="text-error-500">*</span></Label>
            <Select
              options={[
                { value: "MUY BUENA", label: "MUY BUENA" },
                { value: "BUENA", label: "BUENA" },
                { value: "REGULAR", label: "REGULAR" },
                { value: "MALA", label: "MALA" }
              ]}
              defaultValue={getValues('relacionDocente')}
              onChange={(value) => setValue("relacionDocente", value as "MUY BUENA" | "BUENA" | "REGULAR" | "MALA")}
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
                { value: "MUY BUENA", label: "MUY BUENA" },
                { value: "BUENA", label: "BUENA" },
                { value: "REGULAR", label: "REGULAR" },
                { value: "MALA", label: "MALA" }
              ]}
              defaultValue={getValues('relacionPadres')}
              onChange={(value) => setValue("relacionPadres", value as "MUY BUENA" | "BUENA" | "REGULAR" | "MALA")}
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
                  { value: "MUY BUENA", label: "MUY BUENA" },
                  { value: "BUENA", label: "BUENA" },
                  { value: "REGULAR", label: "REGULAR" },
                  { value: "MALA", label: "MALA" }
                ]}
                defaultValue={getValues('relacionPareja')}
                onChange={(value) => setValue("relacionPareja", value as "MUY BUENA" | "BUENA" | "REGULAR" | "MALA")}
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
        <h3 className="mb-4 text-lg font-semibold">Familia y Economia</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <Label>Tiene internet en casa? <span className="text-error-500">*</span></Label>
            <select
              {...register("internet")}
              className={`w-full rounded-md border px-3 py-2 ${errors.internet ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Seleccione una opción</option>
              <option value="S">Sí</option>
              <option value="N">No</option>
            </select>
            {errors.internet && (
              <p className="text-error-500 text-sm mt-1">{errors.internet.message}</p>
            )}
          </div>
          <div>
            <Label>Cuenta con una computadora/laptop en casa? <span className="text-error-500">*</span></Label>
            <select
              {...register("computadora")}
              className={`w-full rounded-md border px-3 py-2 ${errors.computadora ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="" disabled>Seleccione una opción</option>
              <option value="S">Sí</option>
              <option value="N">No</option>
            </select>
            {errors.computadora && (
              <p className="text-error-500 text-sm mt-1">{errors.computadora.message}</p>
            )}
          </div>
          {/* Estado Familiar */}
            <div>
              <Label>
                Su casa es <span className="text-error-500">*</span>
              </Label>
              <Select
                options={[
                  { value: 'PROPIA', label: 'PROPIA CON SERVICIOS BASICOS' },
                  { value: 'ARRENDADA', label: 'ARRENDADA' },
                  { value: 'FAMILIAR', label: 'DE UN FAMILIAR' },
                  { value: 'PRESTADA', label: 'PRESTADA' },
                ]}
                onChange={(value) => setValue('tipoCasa', value as string, { shouldValidate: true })}
                placeholder="Seleccione su tipo de casa"
                value={getValues('tipoCasa')}
              />
            </div>
            <div>
              <Label>
                Origen de recursos de estudios <span className="text-error-500">*</span>
              </Label>
              <Select
                options={[
                  { value: 'RECURSOS PROPIOS', label: 'RECURSOS PROPIOS' },
                  { value: 'PADRES / TUTORES', label: 'PADRES / TUTORES' },
                  { value: 'PAREJA SENTIMENTAL', label: 'PAREJA SENTIMENTAL' },
                  { value: 'HERMANOS', label: 'HERMANOS' },
                  { value: 'OTROS MIEMBROS DEL HOGAR', label: 'OTROS MIEMBROS DEL HOGAR' },
                  { value: 'OTROS FAMILIARES', label: 'OTROS FAMILIARES' },
                  { value: 'BECA DE ESTUDIO', label: 'BECA DE ESTUDIO' },
                  { value: 'CREDITO EDUCATIVO', label: 'CREDITO EDUCATIVO' },
                  { value: 'NO REGISTRA', label: 'NO REGISTRA' },
                ]}
                value={getValues('origenRecursos')}
                onChange={(value) =>
                  setValue('origenRecursos', value as string, { shouldValidate: true })
                }
                placeholder="Seleccione el origen de los recursos"
              />
            </div>
            <div>
              <Label>
                Origen de recursos de sustento <span className="text-error-500">*</span>
              </Label>
              <Select
                options={[
                  { value: 'SUELDOS Y SALARIOS PROPIOS', label: 'SUELDOS Y SALARIOS PROPIOS' },
                  { value: 'SUELDOS Y SALARIOS DE PADRES O TUTORES', label: 'SUELDOS Y SALARIOS DE PADRES O TUTORES' },
                  { value: 'SUELDOS Y SALARIOS DE HIJOS', label: 'SUELDOS Y SALARIOS DE HIJOS' },
                  { value: 'SUELDOS Y SALARIOS DE OTROS MIEMBROS DEL HOGAR', label: 'SUELDOS Y SALARIOS DE OTROS MIEMBROS DEL HOGAR' },
                  { value: 'VENTA DE BIENES Y/O SERVICIOS', label: 'VENTA DE BIENES Y/O SERVICIOS' },
                  { value: 'RENTAS (INVERSIONES, BIENES)', label: 'RENTAS (INVERSIONES, BIENES)' },
                  { value: 'REMESAS', label: 'REMESAS' },
                  { value: 'PENSIONES', label: 'PENSIONES' },
                  { value: 'APOYOS ECONOMICOS DE OTRAS PERSONAS FUERA DEL HOGAR', label: 'APOYOS ECONOMICOS DE OTRAS PERSONAS FUERA DEL HOGAR' },
                  { value: 'APOYOS ECONOMICOS DEL ESTADO', label: 'APOYOS ECONOMICOS DEL ESTADO' },
                  { value: 'APOYOS ECONOMICOS DE ONG', label: 'APOYOS ECONOMICOS DE ONG' },
                  { value: 'DONACIONES / CARIDAD', label: 'DONACIONES / CARIDAD' },
                ]}
                value={getValues('origenEstudios')}
                onChange={(value) =>
                  setValue('origenEstudios', value as string, { shouldValidate: true })
                }
                placeholder="Seleccione el origen de recursos para estudios"
              />
            </div>
            <div>
              <Label>
                Estado Familiar <span className="text-error-500">*</span>
              </Label>
            <Select
              options={[
                { value: 'CABEZAHOGAR', label: 'CABEZA DE HOGAR' },
                { value: 'FAMILIA', label: 'VIVE CON FAMILIAR' },
                { value: 'INDEPENDIENTE', label: 'INDEPENDIENTE' },
              ]}
              onChange={(value) => {
                setValue('estadoFamiliar', value as 'CABEZAHOGAR' | 'FAMILIA' | 'INDEPENDIENTE', { shouldValidate: true });
                if (value === 'INDEPENDIENTE') {
                  setValue('miembros', [], { shouldValidate: true });
                }
              }}
              placeholder="Seleccione su estado familiar"
            />
            {errors.estadoFamiliar && (
              <p className="mt-1 text-sm text-error-500">{errors.estadoFamiliar.message}</p>
            )}
            </div>
          {/* Miembros (condicional para CABEZAHOGAR o vivePadres) */}
          {(estadoFamiliar === 'CABEZAHOGAR' || estadoFamiliar === 'FAMILIA') && (
            <div className="col-span-1 sm:col-span-2">
              <h4 className="mb-4 text-lg font-semibold">
                {estadoFamiliar === 'CABEZAHOGAR' ? 'Miembros de la familia' : 'Miembros del hogar'}
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
                          { value: 'CONYUGE', label: 'CÓNYUGE' },
                          { value: 'HIJO', label: 'HIJO/A' },
                          { value: 'PADRE', label: 'PADRE' },
                          { value: 'MADRE', label: 'MADRE' },
                          { value: 'HERMANO', label: 'HERMANO/a' },
                          { value: 'OTRO', label: 'OTRO' },
                        ]}
                        onChange={(value) => setValue(`miembros.${index}.parentesco`, value as 'CONYUGE' | 'HIJO' | 'PADRE' | 'MADRE' | 'HERMANO' | 'OTRO')}
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
                        <option value="0-5">0 - 5 años</option>
                        <option value="6-12">6 - 12 años</option>
                        <option value="13-17">13 - 17 años</option>
                        <option value="18-25">18 - 25 años</option>
                        <option value="26-35">26 - 35 años</option>
                        <option value="36-45">36 - 45 años</option>
                        <option value="46-60">46 - 60 años</option>
                        <option value="60+">Más de 60 años</option>
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
                        <option value="0">No Trabaja</option>
                        <option value="1">Menos de $470</option>
                        <option value="2">$470 - $1000</option>
                        <option value="3">Más de $1000</option>
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
                onClick={() => append({ sueldo: "", edad: "", parentesco: "OTRO", ocupacion: "otro" })}
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
              ¿Presenta discapacidad o Necesidades educativas especiales (NEE)? <span className="text-error-500">*</span>
            </Label>
            <Select
              options={[
                { value: 'S', label: 'Sí' },
                { value: 'N', label: 'No' },
              ]}
              onChange={(value) => {
                setValue('tieneDiscapacidad', value as 'S' | 'N', { shouldValidate: true });
                if (value === 'N') {
                  setValue('discapacidad', undefined, { shouldValidate: true });
                } else {
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
          {tieneDiscapacidad === 'S' && (
            <div className="col-span-1 sm:col-span-2">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <Label>
                    Nombre de la discapacidad <span className="text-error-500">*</span>
                  </Label>
                  <Select
                    options={[
                      { value: 'FISICA', label: 'Física' },
                      { value: 'PSIQUICA', label: 'Psíquica' },
                      { value: 'AUDITIVA', label: 'Auditiva' },
                      { value: 'VISUAL', label: 'Visual' },
                      { value: 'INTELECTUAL', label: 'Intelectual' },
                      { value: 'MULTIPLE', label: 'Múltiple' },
                    ]}
                    onChange={(value) => setValue('discapacidad.tipo', value as 'FISICA' | 'PSIQUICA' | 'AUDITIVA' | 'VISUAL' | 'INTELECTUAL' | 'MULTIPLE', { shouldValidate: true })}
                    placeholder="Seleccione el tipo de discapacidad"
                  />
                </div>
                <div>
                  <Label>
                    ¿Tiene Diagnóstico Presuntivo? <span className="text-error-500">*</span>
                  </Label>
                  <Select
                    options={[
                      { value: 'SI', label: 'Sí' },
                      { value: 'NO', label: 'No' },
                    ]}
                    onChange={(value) => {
                      setValue('discapacidad.tieneDiagnosticoPresuntivo', value as 'SI' | 'NO', { shouldValidate: true });
                    }}
                    placeholder="Seleccione una opción"
                  />
                  {errors.discapacidad?.tieneDiagnosticoPresuntivo && (
                    <p className="mt-1 text-sm text-error-500">{errors.discapacidad?.tieneDiagnosticoPresuntivo?.message}</p>
                  )}
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
                  <p>{getValues('discapacidad.carnet')}</p>
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
                { value: 'S', label: 'Sí' },
                { value: 'N', label: 'No' },
              ]}
              onChange={(value) => {
                setValue('tieneEnfermedadCronica', value as 'S' | 'N', { shouldValidate: true });
                if (value === 'N') {
                  setValue('enfermedadCronica', undefined, { shouldValidate: true });
                } else {
                  setValue('enfermedadCronica', { nombre: '', lugaresTratamiento: '' }, { shouldValidate: true });
                }
              }}
              placeholder="Seleccione una opción"
            />
            {errors.tieneEnfermedadCronica && (
              <p className="mt-1 text-sm text-error-500">{errors.tieneEnfermedadCronica.message}</p>
            )}
          </div>

          {/* Campos condicionales para enfermedad crónica */}
          {tieneEnfermedadCronica === 'S' && (
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
                        { value: 'Clinica Privada', label: 'Clínica privada' },
                        { value: 'Publica', label: 'Pública' },
                        { value: 'IESS', label: 'IESS' },
                        { value: 'Otro', label: 'Otro' },
                      ]}
                      onChange={(value) =>
                        setValue('enfermedadCronica.lugaresTratamiento', value as string, { shouldValidate: true })
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
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {/* Campos de contacto de emergencia */}
          <div>
            <Label>
              Contacto de Emergencia <span className="text-error-500">*</span>
            </Label>
            <Select
              options={[
                { value: 'CONYUGE', label: 'CÓNYUGE' },
                { value: 'HIJO', label: 'HIJO/A' },
                { value: 'PADRE', label: 'PADRE' },
                { value: 'MADRE', label: 'MADRE' },
                { value: 'HERMANO', label: 'HERMANO/A' },
                { value: 'OTRO', label: 'OTRO' },
              ]}
              onChange={(value) => {
                setValue('contactoParentesco', value);
              }}
              placeholder="Seleccione una opción"
            />
            {errors.contactoParentesco && (
              <p className="mt-1 text-sm text-error-500">{errors.contactoParentesco.message}</p>
            )}
          </div>
          <div>
            <Label>
              Nombre <span className="text-error-500">*</span>
            </Label>
            <Input
              register={register('contactoNombre')}
              error={!!errors.contactoNombre}
              hint={errors.contactoNombre?.message}
            />
          </div>
          <div>
            <Label>
              Celular <span className="text-error-500">*</span>
            </Label>
            <Input
              register={register('contactoCelular')}
              error={!!errors.contactoCelular}
              hint={errors.contactoCelular?.message}
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