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

// ---------- Viaje ----------

export interface DatosPais {
  /** ISO alpha-2 (ES, FR, DE, …) o "BAL" para travesías marítimas. */
  codigo: string;
  moneda: string;
  simbolo: string;
  idioma: string;
  capital: string;
}

export interface Etapa {
  id: string;
  pais: string;
  dias_aprox: number;
  tema: string;
  opcional?: boolean;
  /** "travesia" marca ferries / tramos sin parada terrestre. */
  tipo?: 'travesia';
}

export interface Fase {
  id: string;
  nombre: string;
  duracion_dias_aprox: number;
  etapas: Etapa[];
}

export interface Ruta {
  nombre: string;
  descripcion: string;
  inicio_estimado: string;
  duracion_total_dias_aprox: number;
  fases: Fase[];
  datos_paises: Record<string, DatosPais>;
}

export interface FraseIdioma {
  original: string;
  traduccion: string;
  pronunciacion?: string;
}

/** Cuándo se considera el capítulo terminado y se otorga el sello. */
export type CompletadoCriterio =
  /** Cuando el alumno ha completado `valor` actividades de la etapa. */
  | { tipo: 'actividades_etapa_min'; valor: number }
  /** Se otorga al ver la llegada (útil para etapas sin actividades, p.ej. ferries). */
  | { tipo: 'siempre' };

/** Diseño visual del sello (vive en capitulo.json). Distinto del `Sello` ganado. */
export interface DisenoSello {
  descripcion: string;
  color_fondo: string;
  color_texto: string;
}

export interface Capitulo {
  etapa_id: string;
  pais: string;
  /** 2-3 frases narrativas de bienvenida a la etapa. */
  intro: string;
  /** 2-3 datos curiosos del país. */
  datos_curiosos: string[];
  /** 1-2 frases típicas en el idioma local con su traducción. */
  frases_idioma: FraseIdioma[];
  sello: DisenoSello;
  completado_criterio: CompletadoCriterio;
}

export interface Sello {
  /** Fecha en que se ganó, ISO yyyy-mm-dd. */
  fecha: string;
}

export interface ViajeProgress {
  etapaActualId: string;
  /** Etapa ids cuyo capítulo (pantalla de LlegadaPais) ya se ha mostrado. */
  capitulosVistos: string[];
  /** Sellos conseguidos por etapa. */
  sellos: Record<string, Sello>;
  /** Estrellas (1-3) conseguidas por etapa, según el % de aciertos. */
  estrellas: Record<string, number>;
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
  viaje: ViajeProgress;
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
