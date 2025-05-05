import AsyncSelect from "react-select/async";
import axiosInstance from "../../services/axiosInstance";

type Option = {
  value: string;
  label: string;
  tipoValue?: string;
  tipoLabel?: string;
};

interface Props {
  value: Option | null;
  onChange: (value: Option | null) => void;
  setTipoColegio?: (tipo: { value: string; label: string }) => void;
}

const ColegioAsyncSelect: React.FC<Props> = ({ value, onChange, setTipoColegio }) => {
  const loadOptions = async (inputValue: string): Promise<Option[]> => {
    if (inputValue.length < 2) return [];

    try {
      const response = await axiosInstance.get(`/ficha/colegio`, {
        params: { search: inputValue },
      });

      return response.data.map((item: any) => ({
        value: String(item.ine_codigo),
        label: item.ine_descripcion,
        tipoValue: String(item.tie_codigo),
        tipoLabel: item.tie_descripcion,
      }));
    } catch (error) {
      console.error("Error cargando colegios:", error);
      return [];
    }
  };

  const handleChange = (selected: Option | null) => {
    onChange(selected);
    if (selected && setTipoColegio) {
      setTipoColegio({
        value: selected.tipoValue || "",
        label: selected.tipoLabel || "",
      });
    }
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
