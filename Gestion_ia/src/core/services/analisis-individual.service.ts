import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AnalisisIndividualResponse } from '../models/analisis.model';

@Injectable({ providedIn: 'root' })
export class AnalisisIndividualService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl;

  analizar(nit: string, periodo?: string): Observable<AnalisisIndividualResponse> {
    let params = new HttpParams();
    if (periodo) params = params.set('periodo', periodo);
    return this.http.post<AnalisisIndividualResponse>(`${this.baseUrl}/analizar/${nit}`, null, { params });
  }
}
