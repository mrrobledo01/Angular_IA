import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AnalisisComportamentalService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl;

  obtenerComportamiento(nit: string, params: {
    periodo?: string; ciiu?: string; regimen?: string; min_pares?: number;
  } = {}): Observable<any> {
    let httpParams = new HttpParams();
    if (params.periodo) httpParams = httpParams.set('periodo', params.periodo);
    if (params.ciiu) httpParams = httpParams.set('ciiu', params.ciiu);
    if (params.regimen) httpParams = httpParams.set('regimen', params.regimen);
    if (params.min_pares) httpParams = httpParams.set('min_pares', params.min_pares);
    return this.http.get<any>(`${this.baseUrl}/contribuyente/${nit}/comportamiento`, { params: httpParams });
  }

  obtenerExpediente(nit: string, params: { periodo?: string; min_pares?: number } = {}): Observable<any> {
    let httpParams = new HttpParams();
    if (params.periodo) httpParams = httpParams.set('periodo', params.periodo);
    if (params.min_pares) httpParams = httpParams.set('min_pares', params.min_pares);
    return this.http.get<any>(`${this.baseUrl}/contribuyente/${nit}/expediente-fiscal`, { params: httpParams });
  }

  obtenerGrafoRiesgo(nit: string, params: {
    periodo?: string; min_pares?: number; incluir_comportamiento?: boolean;
  } = {}): Observable<any> {
    let httpParams = new HttpParams();
    if (params.periodo) httpParams = httpParams.set('periodo', params.periodo);
    if (params.min_pares) httpParams = httpParams.set('min_pares', params.min_pares);
    if (params.incluir_comportamiento !== undefined) httpParams = httpParams.set('incluir_comportamiento', params.incluir_comportamiento);
    return this.http.get<any>(`${this.baseUrl}/contribuyente/${nit}/grafo-riesgo`, { params: httpParams });
  }

  obtenerVisorGrafo(nit: string, periodo?: string): Observable<any> {
    let params = new HttpParams();
    if (periodo) params = params.set('periodo', periodo);
    return this.http.get(`${this.baseUrl}/visor/grafo/${nit}`, { params, responseType: 'text' });
  }
}
