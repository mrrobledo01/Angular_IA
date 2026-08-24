import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { HealthStatus } from '../models/health.model';

@Injectable({ providedIn: 'root' })
export class HealthService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl;

  check(): Observable<HealthStatus> {
    return this.http.get<HealthStatus>(`${this.baseUrl}/health`);
  }
}
