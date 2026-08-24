export type EstadoHallazgo = 'DETECTADO' | 'NO_ACCIONABLE' | 'VALIDADO' | 'DESCARTADO' | 'SOLICITA_MAS_INFO' | 'TRASLADADO_A_PROCESO';
export type ReglaFiscalizacion = 'R1' | 'R2' | 'R3' | 'R4' | 'R5' | 'R6' | 'R7' | 'R8' | 'R9' | 'R10';
export type DecisionRevision = 'VALIDAR' | 'DESCARTAR' | 'PEDIR_INFO' | 'TRASLADAR';

export interface CrearHallazgoRequest {
  contribuyente_nit: string;
  regla: ReglaFiscalizacion;
  periodo: string;
  tipo_hallazgo?: string;
  fuerza_probatoria?: string;
  brecha_valor?: number;
  impuesto_estimado?: number;
  evidencias?: any[];
}

export interface Hallazgo {
  id: string;
  contribuyente_nit: string;
  regla: ReglaFiscalizacion;
  periodo: string;
  tipo_hallazgo: string;
  fuerza_probatoria: string;
  brecha_valor: number;
  impuesto_estimado: number;
  score: number;
  score_componentes?: any;
  ventana_limite: string;
  accionable: boolean;
  estado: EstadoHallazgo;
  resumen?: string;
  proceso_id?: string;
  entidad_id?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
  evidencias?: any[];
  revisiones?: any[];
}

export interface ListarHallazgosResponse {
  total: number;
  page: number;
  page_size: number;
  resultados: Hallazgo[];
}

export interface RevisionRequest {
  funcionario_id: string;
  decision: DecisionRevision;
  motivo?: string;
}

export interface RevisionAgenteRequest {
  usar_ia?: boolean;
}

export interface ReglasEvaluarRequest {
  contribuyente_nit: string;
  periodo: string;
  reglas?: ReglaFiscalizacion[];
}

export interface ReglasEvaluarResponse {
  total: number;
  resultados: any[];
}
