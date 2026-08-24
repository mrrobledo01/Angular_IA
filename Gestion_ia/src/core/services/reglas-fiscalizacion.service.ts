import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ReglasEvaluarRequest, ReglasEvaluarResponse, ReglaFiscalizacion } from '../models/hallazgo.model';

@Injectable({ providedIn: 'root' })
export class ReglasFiscalizacionService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl;

  evaluar(data: ReglasEvaluarRequest): Observable<ReglasEvaluarResponse> {
    let params = new HttpParams();
    if (data.reglas && data.reglas.length > 0) params = params.set('reglas', data.reglas.join(','));
    return this.http.post<any>(`${this.baseUrl}/fiscalizacion/reglas/evaluar/${data.contribuyente_nit}`, null, {
      params: params.set('periodo', data.periodo),
    }).pipe(
      catchError(() => of({ total: 0, resultados: [] }))
    );
  }

  ejecutar(data: ReglasEvaluarRequest): Observable<any[]> {
    let params = new HttpParams().set('periodo', data.periodo);
    if (data.reglas && data.reglas.length > 0) params = params.set('reglas', data.reglas.join(','));
    return this.http.post<any>(`${this.baseUrl}/fiscalizacion/reglas/ejecutar/${data.contribuyente_nit}`, null, { params }).pipe(
      catchError(() => of([]))
    );
  }
}
