interface Option {
    value: string;
    label: string;
    tipoValue?: string;
    tipoLabel?: string;
}


export type FichaSocioeconomica = {
    nombres: string;
    cedula: string;
    fechaNacimiento: string;
    genero: "M" | "F" |"";
    estadoCivil: "SOL" | "CAS" | "DIV" | "VIU" | "";
    email: string;
    nacionalidad: string;
    telefono: string;
    colegio: Option | null;
    tipoColegio: string;
    anioGraduacion: number;
    indigenaNacionalidad: number;
    beca: string;
    carrera: {
        id: string | null;
        nombre: string | null;
    };
    semestre: string;
    promedio: number;
    direccion: string;
    etnia: "mestizo" | "indigena" | "otro" | "blanco" | "afroecuatoriano" | "montubio" | "mulato" | "negro" | "ninguno" | undefined;
    // nacionalidad: string;
    // etnia: string;
};

export type FichaResponse = {
    message: string;
    ficha: FichaSocioeconomica;
    periodo: boolean;
};