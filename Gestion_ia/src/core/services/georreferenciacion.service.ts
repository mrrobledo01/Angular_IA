import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { PuntoGeorreferenciado } from '../models/punto-georreferenciado.model';

const MOCK_PUNTOS: PuntoGeorreferenciado[] = [
  { nombre: 'Predio Principal', latitud: 10.4687, longitud: -73.2617, descripcion: 'Cra 7 # 12-34, Valledupar' },
  { nombre: 'Sucursal Norte', latitud: 10.4800, longitud: -73.2500, descripcion: 'Av 19 # 45-67, Valledupar' },
  { nombre: 'Bodega', latitud: 10.4550, longitud: -73.2700, descripcion: 'Calle 5 # 8-12, Valledupar' },
];

@Injectable({ providedIn: 'root' })
export class GeorreferenciacionService {
  private http = inject(HttpClient);
  private baseUrl = environment.geoApiUrl;

  obtenerPuntos(idSjtoImpsto: string): Observable<PuntoGeorreferenciado[]> {
    if (environment.useMockGeo) {
      return of(MOCK_PUNTOS);
    }

    return this.http.get<PuntoGeorreferenciado[]>(
      `${this.baseUrl}/contribuyente/${idSjtoImpsto}/georreferencia`
    ).pipe(
      map((puntos) =>
        (puntos || []).filter((p) =>
          p.latitud != null && p.longitud != null &&
          p.latitud !== 0 && p.longitud !== 0 &&
          !isNaN(p.latitud) && !isNaN(p.longitud)
        )
      ),
      catchError(() => of([]))
    );
  }
}
