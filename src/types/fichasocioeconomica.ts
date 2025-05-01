export type FichaSocioeconomica = {
    nombres: string;
    cedula: string;
    fechaNacimiento: string;
    genero: "M" | "F" |"";
    estadoCivil: "SOL" | "CAS" | "DIV" | "VIU" | "";
    email: string;
    nacionalidad: string;
    telefono: string;
    colegio: string;
    tipoColegio: string;
    indigenaNacionalidad: number;
    beca: string | null;
    carrera: {
        id: string | null;
        nombre: string | null;
    };
    // nacionalidad: string;
    // etnia: string;
};

export type FichaResponse = {
    message: string;
    ficha: FichaSocioeconomica;
    periodo: boolean;
};