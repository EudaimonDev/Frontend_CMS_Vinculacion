export interface GatekeeperForm {
  nombres?: string;
  edad: number;
  sexo: string;
}

export interface GatekeeperResponse {
  token: string;
  expiresIn: number;
  visitor: {
    id: string;
    nombres: string;
  };
}

export const FACULTADES: string[] = [
  'Ciencias Matemáticas y Físicas',
  'Ciencias Médicas',
  'Ciencias Naturales',
  'Ciencias Psicológicas',
  'Ciencias Económicas',
  'Comunicación Social',
  'Educación Física',
  'Filosofía, Letras y Ciencias de la Educación',
  'Ingeniería Industrial',
  'Ingeniería Química',
  'Jurisprudencia y Ciencias Sociales',
  'Medicina Veterinaria y Zootecnia',
  'Otra / Externo',
];
