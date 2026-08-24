export interface DashboardData {
  total_procesos: number;
  procesos_por_estado: Record<string, number>;
  totales: {
    total_nits: number;
    candidatos: number;
    omisos: number;
    exactos: number;
    inexactos: number;
    intentos_total: number;
  };
  clasificacion: { categoria: string; conteo: number; porcentaje: number }[];
  nivel_riesgo: { categoria: string; conteo: number; porcentaje: number }[];
  srf_stats: { promedio: number; minimo: number; maximo: number };
  cobertura_ciiu: { nits_con_ciiu: number; nits_unicos: number };
  volumen_analisis: { nits_unicos: number; tokens_input: number; tokens_output: number; nits_con_incidencias: number };
  errores: { proceso: Record<string, any>; detalle: Record<string, any> };
}
