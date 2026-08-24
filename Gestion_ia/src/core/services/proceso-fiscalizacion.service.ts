import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  CrearProcesoRequest,
  ProcesoCreadoResponse,
  ProcesoHeader,
  ListarProcesosResponse,
  ProcesoStatusResponse,
  ListarResultadosResponse,
  ListarErroresResponse,
  RankingItem,
} from '../models/proceso.model';

@Injectable({ providedIn: 'root' })
export class ProcesoFiscalizacionService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl;

  crear(data: CrearProcesoRequest): Observable<ProcesoCreadoResponse> {
    return this.http.post<ProcesoCreadoResponse>(`${this.baseUrl}/proceso`, data);
  }

  listar(entidadNit: string, page = 1, pageSize = 50): Observable<ListarProcesosResponse> {
    const params = new HttpParams()
      .set('entidad_nit', entidadNit)
      .set('page', page)
      .set('page_size', pageSize);

    return this.http.get<any>(`${this.baseUrl}/proceso`, { params }).pipe(
      map((res) => {
        const paginacion = res.paginacion || {};
        const procesos = (res.procesos || res.resultados || []).map((p: any) => ({
          proceso_id: p.id || p.proceso_id,
          entidad_nit: p.entidad_nit || entidadNit,
          nombre: p.nombre,
          estado: p.estado,
          fecha_creacion: p.created_at || p.fecha_creacion,
          total_nits: p.total_nits,
          periodo: p.periodo,
          candidatos: p.candidatos,
          omisos: p.omisos,
          exactos: p.exactos,
          inexactos: p.inexactos,
        }));
        return {
          page: paginacion.page || page,
          page_size: paginacion.page_size || pageSize,
          total: paginacion.total_registros || procesos.length,
          resultados: procesos,
        };
      }),
      catchError(() => of({ page, page_size: pageSize, total: 0, resultados: [] }))
    );
  }

  obtenerEstado(procesoId: string): Observable<ProcesoStatusResponse> {
    return this.http.get<ProcesoStatusResponse>(`${this.baseUrl}/proceso/${procesoId}/status`);
  }

  obtenerResultados(procesoId: string, params: {
    page?: number; page_size?: number; intento_id?: number;
    include_partial?: boolean; clasificacion?: string;
    min_score?: number; ordenar_por?: string; direccion?: string;
  } = {}): Observable<ListarResultadosResponse> {
    let httpParams = new HttpParams();
    if (params.page) httpParams = httpParams.set('page', params.page);
    if (params.page_size) httpParams = httpParams.set('page_size', params.page_size);
    if (params.intento_id) httpParams = httpParams.set('intento_id', params.intento_id);
    if (params.include_partial !== undefined) httpParams = httpParams.set('include_partial', params.include_partial);
    if (params.clasificacion) httpParams = httpParams.set('clasificacion', params.clasificacion);
    if (params.min_score) httpParams = httpParams.set('min_score', params.min_score);
    if (params.ordenar_por) httpParams = httpParams.set('ordenar_por', params.ordenar_por);
    if (params.direccion) httpParams = httpParams.set('direccion', params.direccion);

    return this.http.get<any>(`${this.baseUrl}/proceso/${procesoId}/results`, { params: httpParams }).pipe(
      map((res) => ({
        estado: res.estado || '',
        parcial: res.parcial || false,
        page: res.page || params.page || 1,
        page_size: res.page_size || params.page_size || 50,
        total: res.total || 0,
        resultados: res.resultados || res.data || [],
      })),
      catchError(() => of({ estado: '', parcial: false, page: 1, page_size: 50, total: 0, resultados: [] }))
    );
  }

  obtenerDetalle(procesoId: string, entidadNit: string, page = 1, pageSize = 50): Observable<any> {
    const params = new HttpParams()
      .set('entidad_nit', entidadNit)
      .set('page', page)
      .set('page_size', pageSize);

    return this.http.get<any>(`${this.baseUrl}/proceso/${procesoId}/detalle`, { params }).pipe(
      catchError(() => of({ page, page_size: pageSize, total: 0, resultados: [] }))
    );
  }

  obtenerErrores(procesoId: string, params: {
    intento_id?: number; capa?: string; nit?: string;
  } = {}): Observable<ListarErroresResponse> {
    let httpParams = new HttpParams();
    if (params.intento_id) httpParams = httpParams.set('intento_id', params.intento_id);
    if (params.capa) httpParams = httpParams.set('capa', params.capa);
    if (params.nit) httpParams = httpParams.set('nit', params.nit);

    return this.http.get<any>(`${this.baseUrl}/proceso/${procesoId}/errors`, { params: httpParams }).pipe(
      map((res) => ({
        errores_proceso: res.errores_proceso || [],
        errores_detalle: res.errores_detalle || res.data || [],
      })),
      catchError(() => of({ errores_proceso: [], errores_detalle: [] }))
    );
  }

  exportar(procesoId: string, formato = 'xlsx'): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/proceso/${procesoId}/export`, {
      params: new HttpParams().set('formato', formato),
      responseType: 'blob',
    });
  }

  rankingComportamental(procesoId: string, params: {
    periodo?: string; limite?: number; min_score?: number; min_pares?: number;
  } = {}): Observable<RankingItem[]> {
    let httpParams = new HttpParams();
    if (params.periodo) httpParams = httpParams.set('periodo', params.periodo);
    if (params.limite) httpParams = httpParams.set('limite', params.limite);
    if (params.min_score) httpParams = httpParams.set('min_score', params.min_score);
    if (params.min_pares) httpParams = httpParams.set('min_pares', params.min_pares);

    return this.http.get<any>(`${this.baseUrl}/proceso/${procesoId}/ranking-comportamental`, { params: httpParams }).pipe(
      map((res) => res.resultados || []),
      catchError(() => of([]))
    );
  }

  cancelar(procesoId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/proceso/${procesoId}/cancelar`, {});
  }
}
