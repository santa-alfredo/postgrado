import { useEffect, useState } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import FormSocioeconomico from "../components/FichaSocioeconomica/FormSocioeconomico";
import axiosInstance from "../services/axiosInstance";
import { useNavigate } from "react-router";
const API_BASE = import.meta.env.VITE_API_BASE;

// const defaultData = {
//   // Información Personal
//   nombres: '',
//   cedula: '',
//   fechaNacimiento: '',
//   genero: '',
//   estadoCivil: '',
//   telefono: '',
//   email: '',
//   cambioResidencia: false,
//   direccion: '',
//   provinciaId: '',
//   ciudadId: '',
//   parroquiaId: '',

//   // Información Académica
//   carrera: '',
//   colegio: '',
//   tipoColegio: '',
//   anioGraduacion: 2025,
//   semestre: '',
//   promedio: 0,
//   estudioOtraUniversidad: false,
//   otraUniversidad: undefined,
//   beca: false,

//   // Información Económica
//   ingresosFamiliares: '0.00',
//   gastosMensuales: '0.00',
//   vivienda: '0.00',
//   transporte: '0.00',
//   alimentacion: '0.00',
//   otrosGastos: '0.00',

//   // Información Laboral
//   situacionLaboral: 'empleado',
//   laboral: undefined,

//   // Relaciones Personales
//   relacionCompa: 'buena',
//   integracionUmet: 'si',
//   relacionDocente: 'buena',
//   relacionPadres: 'buena',
//   relacionPareja: undefined,

//   // Familia
//   estadoFamiliar: 'cabezaHogar',
//   miembros: [],

//   // Salud
//   tieneDiscapacidad: 'no',
//   discapacidad: undefined,

//   tieneEnfermedadCronica: 'no',
//   enfermedadCronica: undefined,

//   // Documentos
//   documentos: null,
// };

export default function Ficha() {
  const navigate = useNavigate();
  const [fichaExistente, setFichaExistente] = useState<null | { id: string }>(null);
  const [periodoValido, setPeriodoValido] = useState(false);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFicha = async () => {
      try {
        const response = await axiosInstance.get('/ficha/me');

        if (response.status !== 200) {
          throw new Error("No se pudo obtener la ficha");
        }

        const data = response.data;
        console.log('data', data);
        if (data?.ficha) {
          console.log('data.ficha', data.ficha);
          setFichaExistente(data.ficha);
          setPeriodoValido(data.periodo);
        }
      } catch (error: any) {
        console.error("Error al obtener la ficha:", error);
        if (error.response?.status === 401) {
          navigate('/signin');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFicha();
  }, []);

  return (
    <>
      <PageMeta
        title="Ficha Socioeconómica | Sistema de Becas"
        description="Formulario de ficha socioeconómica para solicitud de becas"
      />
      <PageBreadcrumb pageTitle="Ficha Socioeconómica" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Ficha Socioeconómica
        </h3>

        {loading ? (
          <p>Cargando...</p>
        ) : periodoValido && fichaExistente ? (
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-white/80">
              Ya has registrado tu ficha socioeconómica. Gracias por completar la información.
            </p>
            <a
              className="inline-block rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              href={`${API_BASE}/ficha/${fichaExistente.id}/pdf`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Ver ficha en PDF
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            <FormSocioeconomico 
              onSuccess={(data) => {
                console.log(data, "data");
                setFichaExistente(data);
                setPeriodoValido(true);
                setLoading(false);
              }}
            />
          </div>
        )}
      </div>
    </>
  );
}
