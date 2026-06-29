// Tipos base que comparte toda la app.
// Mantener estos tipos estables: si cambian, el contenido JSON ya creado puede romper.

export type Nivel = '5-primaria' | '1-eso';
export type Materia = 'matematicas' | 'lengua';
export type Formato = 'digital' | 'cuaderno' | 'mixto';

export type ActivityType =
  | 'multiple_choice'
  | 'fill_blank'
  | 'number_input'
  | 'cuaderno_problema';

export interface ActivityBase {
  id: string;
  type: ActivityType;
  formato: Formato;
  nivel: Nivel;
  materia: Materia;
  /** Código del saber básico del currículo (p.ej. MAT.1.A.2.1 o '5pri-fracciones'). */
  saber_basico: string;
  /** 1 fácil — 3 difícil. */
  dificultad: 1 | 2 | 3;
  /** XP que otorga al completarse. */
  xp: number;
  /** Tiempo estimado en segundos (lo usa el planificador para no pasarse de la hora diaria). */
  tiempo_estimado_s: number;
  enunciado: string;
}

export interface MultipleChoiceActivity extends ActivityBase {
  type: 'multiple_choice';
  formato: 'digital';
  opciones: string[];
  correcta: number;
  explicacion?: string;
}

export interface FillBlankActivity extends ActivityBase {
  type: 'fill_blank';
  formato: 'digital';
  /** Texto con marcadores {0}, {1}, ... que se reemplazan por inputs. */
  texto: string;
  /** Respuestas aceptadas para cada hueco (admite varias por hueco). */
  respuestas: string[][];
  /** Si true, compara ignorando tildes y mayúsculas. */
  flexible?: boolean;
  explicacion?: string;
}

export interface NumberInputActivity extends ActivityBase {
  type: 'number_input';
  formato: 'digital';
  respuesta: number;
  /** Tolerancia absoluta para decimales (p.ej. 0.01). */
  tolerancia?: number;
  unidad?: string;
  explicacion?: string;
}

export interface CuadernoProblemaActivity extends ActivityBase {
  type: 'cuaderno_problema';
  formato: 'cuaderno';
  pistas?: string[];
  solucion: string;
}

export type Activity =
  | MultipleChoiceActivity
  | FillBlankActivity
  | NumberInputActivity
  | CuadernoProblemaActivity;

/** Índice de una materia: lista de unidades y archivos JSON donde viven las actividades. */
export interface MateriaIndex {
  nivel: Nivel;
  materia: Materia;
  unidades: Array<{
    id: string;
    titulo: string;
    saberes: string[];
    archivo: string; // relativo a /content/<nivel>/<materia>/
  }>;
}

// ---------- Perfil y progreso ----------

export interface Profile {
  id: string;
  nombre: string;
  nivel: Nivel;
  avatar: AvatarConfig;
  creado: number; // timestamp
}

export interface AvatarConfig {
  base: string;       // p.ej. 'explorer-1'
  pelo: string;
  ropa: string;
  accesorio?: string;
  fondo: string;
}

export interface ProgressState {
  perfiles: Profile[];
  perfilActivo: string | null;
  porPerfil: Record<string, PerPerfilProgress>;
}

export interface PerPerfilProgress {
  xpTotal: number;
  rachaDias: number;
  ultimaActividadFecha: string | null; // ISO yyyy-mm-dd
  actividadesCompletadas: Record<string, CompletedActivity>;
  saberesDominados: string[];
  logrosDesbloqueados: string[];
  /** Tiempo invertido hoy (en segundos), se resetea al cambiar de día. */
  tiempoHoyS: number;
  fechaHoy: string | null;
}

export interface CompletedActivity {
  fecha: string;          // ISO yyyy-mm-dd
  acierto: boolean;       // null si era cuaderno y se confió en el alumno
  intentos: number;
  xpGanado: number;
}

export interface DailySession {
  fecha: string;
  actividades: Activity[];
  duracionEstimadaS: number;
}
