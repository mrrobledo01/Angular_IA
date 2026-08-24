export interface EntidadFiscalizadora {
  entidad_nit: string;
  nombre: string;
  email?: string;
  activo?: boolean;
}

export interface CrearEntidadRequest {
  entidad_nit: string;
  nombre: string;
  email?: string;
}

export interface ListarEntidadesResponse {
  page: number;
  page_size: number;
  resultados: EntidadFiscalizadora[];
}
