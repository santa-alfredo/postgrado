import { useState, useEffect } from "react";
import axiosInstance from "../../services/axiosInstance";

interface Option {
  value: string;
  label: string;
  tipoValue?: string;
  tipoLabel?: string;
}

interface AsyncSelectProps {
  value: string | number; // Puede ser 0 si viene vacío
  onChange: (value: string) => void;
  setTipoColegio?: (tipo: { value: string; label: string }) => void;
  placeholder?: string;
  tipo?: string;
}

const AsyncSelect: React.FC<AsyncSelectProps> = ({
  value,
  onChange,
  placeholder = "Buscar colegio",
  tipo = "particular",
  setTipoColegio,
}) => {
  const [options, setOptions] = useState<Option[]>([]);
  const [search, setSearch] = useState("");
  const [initialized, setInitialized] = useState(false);

  // 🔁 Buscar colegios por texto
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await axiosInstance.get(`/ficha/colegio`, {
          params: { search, tipo },
        });
        console.log("/ficha/colegio",response.data);
        const newOpts = response.data.map((item: any) => ({
          value: String(item.ine_codigo),
          label: item.ine_descripcion,
          tipoValue: String(item.tie_codigo),
          tipoLabel: item.tie_descripcion,
        }));
    
        // setOptions((prev) => {
        //   const existingValues = new Set(prev.map((opt) => String(opt.value)));
        //   const uniqueNewOpts = newOpts.filter((opt: any) => !existingValues.has(opt.value));
        //   return [...prev, ...uniqueNewOpts];
        // });
        setOptions(newOpts);
      } catch (error) {
        console.error("Error fetching colegios:", error);
        setOptions([]);
      }
    };

    const delayDebounce = setTimeout(() => {
      if (search.length >= 2) fetchOptions();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search, tipo]);

  // ⚡ Si viene un value inicial (por ejemplo, 66), obtener su nombre
  useEffect(() => {
    const loadInitialOption = async () => {
      if (!value || value === "0" || initialized) return;
  
      const alreadyExists = options.some((opt) => String(opt.value) === String(value));
      if (alreadyExists) {
        console.log("ya existe",value);
        setInitialized(true);
        return;
      }
  
      try {
        const response = await axiosInstance.get(`/ficha/colegio/${value}`);
        console.log("hacer la llamada a ficha/colegio",response.data);
        const option = {
          value: String(response.data.ine_codigo),
          label: response.data.ine_descripcion,
          tipoValue: String(response.data.tie_codigo),
          tipoLabel: response.data.tie_descripcion,
        };

        const tipoOption = {
          value: String(response.data.tie_codigo),
          label: response.data.tie_descripcion,
        };

        setOptions((prev) => {
          const exists = prev.some((o) => o.value === option.value);
          return exists ? prev : [...prev, option];
        });

        if (setTipoColegio) {
          console.log("tipoOption notificar al padre",tipoOption);
          setTipoColegio(tipoOption); // <== Aquí notificas al padre
        }

        setInitialized(true);
      } catch (err) {
        console.error("No se pudo cargar el colegio inicial", err);
      }
    };
  
    loadInitialOption();
  }, [value, initialized, options]);

  return (
    <div>
      <input
        type="text"
        className="w-full border rounded px-4 py-2 mb-2"
        placeholder={placeholder}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <select
        value={value}
        onChange={(e) => {
          const selected = e.target.value;
          const tipoValue = e.target.selectedOptions[0].getAttribute("data-tipo-value");
          console.log("selected",tipoValue);
          if (setTipoColegio) {
            setTipoColegio({
              value: tipoValue!,
              label: "",
            });
          }
          // Si la opción seleccionada no existe en options, añadirla como temporal
          const exists = options.some((opt) => opt.value === selected);
          if (!exists && selected !== "0") {
            setOptions((prev) => {
              const alreadyExists = prev.some((opt) => String(opt.value) === String(selected));
              if (alreadyExists) return prev;
          
              const newOptions = [...prev, { value: selected, label: `Colegio seleccionado (${selected})` }];
              
              // ✅ Después de asegurar que el valor ya existe, actualizas el valor seleccionado
              onChange(selected);
          
              return newOptions;
            });
          } else {
            // ✅ Si ya existe, puedes cambiarlo directamente
            onChange(selected);
          }
        }}
        className="w-full border rounded px-4 py-2"
      >
        <option value="0">Seleccione un colegio</option>
        {options.map((opt) => (
          <option
            key={opt.value}
            value={opt.value}
            data-tipo-value={opt.tipoValue}
            data-tipo-label={opt.tipoLabel}
          >
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default AsyncSelect;
