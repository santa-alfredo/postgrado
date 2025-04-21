import { useForm } from "react-hook-form";
import { useState} from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Form from "../ficha/Form";
import Label from "../ficha/Label";
import Input from "../ficha/input/InputField";
import Select from "../ficha/Select";
import FileInput from "../ficha/input/FileInput";

// Esquema de validación con Zod
const formSchema = z.object({
  // Información Personal
  nombres: z.string()
    .min(2, "Los nombres deben tener al menos 2 caracteres")
    .max(50, "Los nombres no pueden exceder 50 caracteres")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "Los nombres solo pueden contener letras y espacios"),
  apellidos: z.string()
    .min(2, "Los apellidos deben tener al menos 2 caracteres")
    .max(50, "Los apellidos no pueden exceder 50 caracteres")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "Los apellidos solo pueden contener letras y espacios"),
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
  direccion: z.string()
    .min(10, "La dirección debe tener al menos 10 caracteres")
    .max(200, "La dirección no puede exceder 200 caracteres"),
  
  // Información Académica
  carrera: z.string()
    .min(2, "La carrera debe tener al menos 2 caracteres")
    .max(100, "La carrera no puede exceder 100 caracteres"),
  semestre: z.string()
    .min(1, "El semestre es requerido")
    .regex(/^\d+$/, "El semestre debe ser un número"),
  promedio: z.string()
    .min(1, "El promedio es requerido")
    .regex(/^\d+(\.\d{1,2})?$/, "El promedio debe ser un número con máximo 2 decimales"),
  universidad: z.string()
    .min(2, "La universidad debe tener al menos 2 caracteres")
    .max(100, "La universidad no puede exceder 100 caracteres"),
  
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
  documentos: z.instanceof(FileList)
    .refine((files) => files.length > 0, "Debe subir al menos un documento")
});

type FormData = z.infer<typeof formSchema>;

export default function FormSocioeconomico() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm<FormData>({
    resolver: zodResolver(formSchema)
  });

  const [suggestions, setSuggestions] = useState<string>("");

  const onSubmit = (data: FormData) => {
    console.log(data);
    // Aquí se enviaría la información al backend
  };

  async function checkSpelling(text: string): Promise<string> {
    const response = await fetch("https://api.languagetool.org/v2/check", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        text,
        language: "es",
      }),
    });
  
    const data = await response.json();
  
    let corrected = text;
    let offsetShift = 0;
  
    for (const match of data.matches) {
      const from = match.offset + offsetShift;
      const to = from + match.length;
      const replacement = match.replacements?.[0]?.value;
  
      if (replacement) {
        corrected =
          corrected.slice(0, from) + replacement + corrected.slice(to);
  
        // Ajustar el offset acumulado por los cambios de longitud
        offsetShift += replacement.length - match.length;
      }
    }
  
    return corrected;
  }

  return (
    <Form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Sección 1: Información Personal */}
      <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-800">
        <h3 className="mb-4 text-lg font-semibold">Información Personal</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <Label>Nombres <span className="text-error-500">*</span></Label>
            <Input
              register={register("nombres", { 
                onBlur: async (e) => {
                  const text = e.target.value;
                  const sugerencia = await checkSpelling(text);
                    
                  setValue("nombres", sugerencia);
                  setSuggestions(`Quizás quisiste decir: ${sugerencia}`);
                }
              })}
              error={!!errors.nombres || !!suggestions }
              hint={errors.nombres?.message}
              errorSuggestions={suggestions}
            />
          </div>
          <div>
            <Label>Apellidos <span className="text-error-500">*</span></Label>
            <Input
              register={register("apellidos")}
              error={!!errors.apellidos}
              hint={errors.apellidos?.message}
            />
          </div>
          <div>
            <Label>Cédula <span className="text-error-500">*</span></Label>
            <Input
              register={register("cedula")}
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
        </div>
      </div>

      {/* Sección 2: Información Académica */}
      <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-800">
        <h3 className="mb-4 text-lg font-semibold">Información Académica</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
              register={register("semestre")}
              error={!!errors.semestre}
              hint={errors.semestre?.message}
            />
          </div>
          <div>
            <Label>Promedio <span className="text-error-500">*</span></Label>
            <Input
              type="number"
              step={0.01}
              register={register("promedio")}
              error={!!errors.promedio}
              hint={errors.promedio?.message}
            />
          </div>
          <div>
            <Label>Universidad <span className="text-error-500">*</span></Label>
            <Input
              register={register("universidad")}
              error={!!errors.universidad}
              hint={errors.universidad?.message}
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

      {/* Sección 4: Documentos */}
      <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-800">
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