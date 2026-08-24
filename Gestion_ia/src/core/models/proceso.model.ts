export type TipoRegimen = 'COMUN' | 'SIMPLIFICADO' | 'GRAN_CONTRIBUYENTE' | 'TODOS';
export type TipoProceso = 'BASICO' | 'COMPLETO';
export type EstadoProceso = 'PENDIENTE' | 'PREFILTRANDO' | 'PREFILTRADO_COMPLETADO' | 'EN_COLA' | 'EN_PROCESO' | 'COMPLETADO' | 'ERROR' | 'INTERRUMPIDO' | 'CANCELADO';

export interface CrearProcesoRequest {
  entidad_nit: string;
  nombre: string;
  vigencia_ini: string;
  vigencia_fin: string;
  tipo_regimen?: TipoRegimen;
  actividades_economicas: string[];
  periodo: string;
  tipo?: TipoProceso;
  max_nits?: number;
  umbral_retenciones_pct?: number;
}

export interface ProcesoCreadoResponse {
  proceso_id: number;
  intento_id: number;
  estado: string;
}

export interface ProcesoHeader {
  proceso_id: string;
  entidad_nit: string;
  nombre: string;
  estado: EstadoProceso;
  fecha_creacion: string;
  total_nits?: number;
  periodo?: string;
  candidatos?: number;
  omisos?: number;
  exactos?: number;
  inexactos?: number;
}

export interface ListarProcesosResponse {
  page: number;
  page_size: number;
  total: number;
  resultados: ProcesoHeader[];
}

export interface ProcesoStatusResponse {
  estado: EstadoProceso;
  intento_actual: number;
  intentos_historial: any[];
  progreso: {
    total: number;
    procesados: number;
    porcentaje: number;
  };
  clasificacion?: any;
}

export interface ProcesoResultado {
  contribuyente_nit: string;
  razon_social?: string;
  clasificacion: string;
  srf_total?: number;
  nivel_riesgo?: string;
  hallazgos?: any[];
  explicacion_ia?: string;
}

export interface ListarResultadosResponse {
  estado: string;
  parcial: boolean;
  page: number;
  page_size: number;
  total: number;
  resultados: ProcesoResultado[];
}

export interface ProcesoError {
  id: number;
  capa: string;
  mensaje: string;
  fecha: string;
  nit?: string;
}

export interface ListarErroresResponse {
  errores_proceso: any[];
  errores_detalle: ProcesoError[];
}

export interface RankingItem {
  contribuyente_nit: string;
  razon_social?: string;
  score: number;
  posicion: number;
  metricas?: any;
}
