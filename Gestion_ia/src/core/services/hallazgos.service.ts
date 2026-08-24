import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Hallazgo, ListarHallazgosResponse, CrearHallazgoRequest, RevisionRequest, RevisionAgenteRequest } from '../models/hallazgo.model';

@Injectable({ providedIn: 'root' })
export class HallazgosService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl;

  crear(data: CrearHallazgoRequest): Observable<Hallazgo> {
    return this.http.post<Hallazgo>(`${this.baseUrl}/fiscalizacion/hallazgos`, data);
  }

  listar(params: {
    estado?: string; regla?: string; contribuyente_nit?: string;
    accionable?: boolean; page?: number; page_size?: number;
  } = {}): Observable<ListarHallazgosResponse> {
    let httpParams = new HttpParams();
    if (params.estado) httpParams = httpParams.set('estado', params.estado);
    if (params.regla) httpParams = httpParams.set('regla', params.regla);
    if (params.contribuyente_nit) httpParams = httpParams.set('contribuyente_nit', params.contribuyente_nit);
    if (params.accionable !== undefined) httpParams = httpParams.set('accionable', params.accionable);
    if (params.page) httpParams = httpParams.set('page', params.page);
    if (params.page_size) httpParams = httpParams.set('page_size', params.page_size);

    return this.http.get<any>(`${this.baseUrl}/fiscalizacion/hallazgos`, { params: httpParams }).pipe(
      map((res) => ({
        total: res.total || 0,
        page: res.page || params.page || 1,
        page_size: res.page_size || params.page_size || 50,
        resultados: res.resultados || res.data || [],
      })),
      catchError(() => of({ total: 0, page: 1, page_size: 50, resultados: [] }))
    );
  }

  obtener(hallazgoId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/fiscalizacion/hallazgos/${hallazgoId}`);
  }

  crearDesdeGrafo(nit: string, params: { periodo?: string; min_pares?: number } = {}): Observable<Hallazgo> {
    let httpParams = new HttpParams();
    if (params.periodo) httpParams = httpParams.set('periodo', params.periodo);
    if (params.min_pares) httpParams = httpParams.set('min_pares', params.min_pares);
    return this.http.post<Hallazgo>(`${this.baseUrl}/fiscalizacion/hallazgos/desde-grafo/${nit}`, null, { params: httpParams });
  }

  revisar(hallazgoId: string, data: RevisionRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/fiscalizacion/hallazgos/${hallazgoId}/revision`, data);
  }

  revisarPorAgente(hallazgoId: string, usarIa = true): Observable<any> {
    return this.http.post(`${this.baseUrl}/fiscalizacion/hallazgos/${hallazgoId}/revision-agente`, { usar_ia: usarIa });
  }
}
