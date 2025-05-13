interface Option {
    value: string;
    label: string;
    tipoValue?: string;
    tipoLabel?: string;
}

interface seleccion{
    value: string;
    label: string;
}

export type FichaSocioeconomica = {
    nombres: string;
    cedula: string;
    fechaNacimiento: string;
    genero: "M" | "F" |"";
    generoIdentidad: string;
    orientacionSexual: string;
    estadoCivil: "SOL" | "CAS" | "DIV" | "VIU" | "";
    email: string;
    nacionalidad: string;
    telefono: string;
    colegio: Option | null;
    anioGraduacion: number;
    indigenaNacionalidad: string;
    beca: string;
    carrera: {
        id: string | null;
        nombre: string | null;
    };
    semestre: string;
    promedio: number;
    direccion: string;
    etnia: "MET" | "IND" | "OTR" | "BLA" | "AFR" | "MON" | "MUL" | "NEG" | "NIN" | undefined;
    pais? : seleccion | undefined;
    provincia? : seleccion | undefined;
    ciudad?: seleccion | undefined;
    parroquia?: seleccion | undefined;
    
    tipoCasa: string;
    internet: "S" | "N" | "";
    computadora: "S" | "N" | "";
    origenRecursos: string;
    origenEstudios: string;
    relacionCompa?: "MUY BUENA" | "BUENA"| "REGULAR" | "MALA";
    integracionUmet?: "S" | "N";
    relacionDocente?: "MUY BUENA" | "BUENA"| "REGULAR" | "MALA";
    relacionPadres?: "MUY BUENA" | "BUENA"| "REGULAR" | "MALA";
    relacionPareja?: "MUY BUENA" | "BUENA"| "REGULAR" | "MALA";
};

export type FichaResponse = {
    message: string;
    ficha: FichaSocioeconomica;
    periodo: boolean;
};