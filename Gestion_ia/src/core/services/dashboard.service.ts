import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { DashboardData } from '../models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl;

  getDashboard(): Observable<DashboardData> {
    return this.http.get<DashboardData>(`${this.baseUrl}/dashboard`).pipe(
      catchError(() => of({
        total_procesos: 0,
        procesos_por_estado: {},
        totales: { total_nits: 0, candidatos: 0, omisos: 0, exactos: 0, inexactos: 0, intentos_total: 0 },
        clasificacion: [],
        nivel_riesgo: [],
        srf_stats: { promedio: 0, minimo: 0, maximo: 0 },
        cobertura_ciiu: { nits_con_ciiu: 0, nits_unicos: 0 },
        volumen_analisis: { nits_unicos: 0, tokens_input: 0, tokens_output: 0, nits_con_incidencias: 0 },
        errores: { proceso: {}, detalle: {} },
      } as DashboardData))
    );
  }
}
