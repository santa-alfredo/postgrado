import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import FormSocioeconomico from "../components/FichaSocioeconomica/FormSocioeconomico";

export default function Ficha() {
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
        <div className="space-y-6">
          <FormSocioeconomico />
        </div>
      </div>
    </>
  );
}
