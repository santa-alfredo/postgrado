import AsyncSelect from "react-select/async";
import axiosInstance from "../../services/axiosInstance";
import Swal from "sweetalert2";

type Option = {
  value: string;
  label: string;
  tipoValue?: string;
  tipoLabel?: string;
};

interface Props {
  value: Option | null;
  onChange: (value: Option | null) => void;
}

const ColegioAsyncSelect: React.FC<Props> = ({ value, onChange }) => {
  const loadOptions = async (inputValue: string): Promise<Option[]> => {
    if (inputValue.length < 2) return [];

    try {
      const response = await axiosInstance.get(`/ficha/colegio`, {
        params: { search: inputValue },
      });

      const options = response.data.map((item: any) => ({
        value: String(item.ine_codigo),
        label: `${item.ine_descripcion} (${item.tie_descripcion})`,
        tipoValue: String(item.tie_codigo),
        tipoLabel: item.tie_descripcion,
      }));
      if (options.length === 0) {
        Swal.fire({
          icon: "info",
          title: "Colegio no encontrado",
          text: "Si no encuentra su colegio, por favor comuníquese con Admisiones.",
          confirmButtonText: "Entendido",
        });
      }
      return options
    } catch (error) {
      console.error("Error cargando colegios:", error);
      return [];
    }
  };

  const handleChange = (selected: Option | null) => {
    onChange(selected);
  };

  return (
    <AsyncSelect
      cacheOptions
      defaultOptions
      loadOptions={loadOptions}
      value={value}
      onChange={handleChange}
      placeholder="Buscar colegio..."
      isClearable
    />
  );
};

export default ColegioAsyncSelect;
