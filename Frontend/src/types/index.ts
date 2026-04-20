export interface Doctor {
  id_doctor: number;
  nombre_doctor: string;
  usuario: string;
  cedula_profesional: string;
  telefono: string;
  correo: string | null;
  estado: string;
  especialidad: string;
  id_consultorio?: number;
  nombre_consultorio?: string;
  piso?: number;
  edificio?: string;
  disponible?: boolean;
}

export interface Cita {
  id_cita: number;
  fecha: string;
  hora: string;
  tipo_cita: string;
  estado: string;
  id_paciente: number;
  nombre_paciente: string;
  num_expediente: number;
  sexo: string;
  edad: number;
  id_consultorio: number;
  nombre_consultorio: string;
  piso: number;
  edificio: string;
}

export interface Intervencion {
  id_intervencion: number;
  fecha_intervencion: string;
  observaciones: string;
  estado: string;
  id_cita: number;
  tipo_cita: string;
  id_paciente: number;
  nombre_paciente: string;
  nombre_procedimiento: string;
  nombre_area: string;
  id_auxiliar: number;
  tipo_auxiliar: string;
}

export interface Consulta {
  id_consulta?: number;
  id_paciente: number;
  id_doctor: number;
  id_consultorio: number;
  motivo_consulta: string;
  diagnostico: string;
  tratamiento: string;
  observaciones?: string;
  duracion: number;
  fecha_hora?: string;
  estado?: string;
}

export interface Expediente {
  paciente: {
    id_paciente: number;
    nombre_paciente: string;
    num_expediente: number;
    sexo: string;
    edad: number;
    numero_telefono: string;
    correo: string;
  };
  historial_consultas: any[];
  historial_intervenciones: any[];
  citas: any[];
}
