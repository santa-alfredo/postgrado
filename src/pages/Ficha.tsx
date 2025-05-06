import { useEffect, useState } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import FormSocioeconomico from "../components/FichaSocioeconomica/FormSocioeconomico";
import axiosInstance from "../services/axiosInstance";
import { useNavigate } from "react-router";
import { FichaResponse, FichaSocioeconomica } from "../types/fichasocioeconomica";
import { useAuth } from "../context/AuthContext";
const API_BASE = import.meta.env.VITE_API_BASE;

const defaultFicha: FichaSocioeconomica = {
  nombres: '',
  cedula: '',
  fechaNacimiento: '',
  genero: '',
  estadoCivil: '',
  email: '',
  nacionalidad: '',
  telefono: '',
  colegio: null,
  tipoColegio: '',
  indigenaNacionalidad: 0,
  beca: 'N',
  carrera: {
    id: null,
    nombre: null,
  },
  promedio: 0,
  direccion: '',
  etnia: 'mestizo',
  semestre: '',
  anioGraduacion: 2000
};
export default function Ficha() {
  const navigate = useNavigate();
  const { user } = useAuth()
  const [ficha, setFicha] = useState<FichaResponse["ficha"] | null>(null);
  const [periodoValido, setPeriodoValido] = useState(false);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFicha = async () => {
      try {
        const response = await axiosInstance.get<FichaResponse>("/ficha/me");

        if (response.status !== 200) {
          throw new Error("No se pudo obtener la ficha");
        }

        const data = response.data;
        console.log('fichaData', data);
        if (data?.ficha) {
          console.log('data.ficha', data.ficha);
          setFicha(data.ficha);
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
        ) : periodoValido && ficha ? (
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-white/80">
              Ya has registrado tu ficha socioeconómica. Gracias por completar la información.
            </p>
            <a
              className="inline-block rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              href={`${API_BASE}/ficha/${user?.username}/pdf`}
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
                setFicha(data);
                setPeriodoValido(true);
                setLoading(false);
              }}
              defaultData={ficha ?? defaultFicha}
            />
          </div>
        )}
      </div>
    </>
  );
}
