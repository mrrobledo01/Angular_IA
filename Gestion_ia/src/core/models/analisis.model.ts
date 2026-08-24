export interface AnalisisIndividualResponse {
  contribuyente_nit: string;
  razon_social?: string;
  ciiu?: string;
  clasificacion: string;
  mcp_score?: number;
  mcp_razon?: string;
  srf_total: number;
  componentes_srf?: any[];
  nivel_riesgo: string;
  hallazgos: any[];
  explicacion_ia: string;
  tokens_utilizados: number;
  duracion_ms?: number;
  provider_utilizado?: string;
  cache_hit: boolean;
  modo_degradado: boolean;
}
