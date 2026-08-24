import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { EntidadFiscalizadora, CrearEntidadRequest, ListarEntidadesResponse } from '../models/entidad.model';

@Injectable({ providedIn: 'root' })
export class EntidadFiscalizadoraService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl;

  crear(data: CrearEntidadRequest): Observable<EntidadFiscalizadora> {
    return this.http.post<EntidadFiscalizadora>(`${this.baseUrl}/entidad_fiscalizadora`, data);
  }

  obtener(nit: string): Observable<EntidadFiscalizadora> {
    return this.http.get<EntidadFiscalizadora>(`${this.baseUrl}/entidad_fiscalizadora/${nit}`);
  }

  listar(page = 1, pageSize = 50): Observable<ListarEntidadesResponse> {
    const params = new HttpParams().set('page', page).set('page_size', pageSize);
    return this.http.get<any>(`${this.baseUrl}/entidades_fiscalizadoras`, { params }).pipe(
      map((res) => ({
        page: res.page || page,
        page_size: res.page_size || pageSize,
        resultados: res.resultados || res.data || [],
      })),
      catchError(() => of({ page, page_size: pageSize, resultados: [] }))
    );
  }
}
