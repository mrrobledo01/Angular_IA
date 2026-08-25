import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { DashboardService } from '../../../core/services/dashboard.service';
import { DashboardData } from '../../../core/models/dashboard.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, StatCardComponent, LoadingSpinnerComponent],
  template: `
    <app-page-header title="Dashboard" [breadcrumb]="[{ label: 'Fiscalización' }, { label: 'Dashboard' }]" />

    @if (loading()) {
      <app-loading-spinner message="Cargando dashboard..."></app-loading-spinner>
    } @else if (data()) {
      <div class="row g-4 mb-4">
        <div class="col-md-3">
          <app-stat-card label="Total proceso de analisis" [value]="data()!.total_procesos" icon="bi-clipboard-data" iconBackground="#0d6efd" />
        </div>
        <div class="col-md-3">
          <app-stat-card label="Total Contribuyentes" [value]="formatNumber(data()!.totales.total_nits)" icon="bi-people" iconBackground="#6f42c1" />
        </div>
        <div class="col-md-3">
          <app-stat-card label="Omisos" [value]="formatNumber(data()!.totales.omisos)" icon="bi-exclamation-triangle" iconBackground="#fd7e14" />
        </div>
        <div class="col-md-3">
          <app-stat-card label="Con Incidencias" [value]="formatNumber(data()!.volumen_analisis.nits_con_incidencias)" icon="bi-shield-check" iconBackground="#198754" />
        </div>
      </div>

      <div class="row g-4 mb-4">
        <div class="col-lg-6">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white">
              <h6 class="mb-0 fw-bold">Procesos por Estado</h6>
            </div>
            <div class="card-body">
              @for (entry of procesosPorEstado(); track entry.estado) {
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <span class="text-muted">{{ entry.estado }}</span>
                  <div class="d-flex align-items-center gap-2" style="width: 60%;">
                    <div class="progress flex-grow-1" style="height: 8px;">
                      <div class="progress-bar" [style.width.%]="entry.porcentaje" [ngClass]="entry.color"></div>
                    </div>
                    <span class="fw-bold" style="min-width: 40px; text-align: right;">{{ entry.cantidad }}</span>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>

        <div class="col-lg-6">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white">
              <h6 class="mb-0 fw-bold">Clasificación de Contribuyentes</h6>
            </div>
            <div class="card-body">
              @for (item of data()!.clasificacion; track item.categoria) {
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <span class="badge" [ngClass]="getClasificacionColor(item.categoria)">{{ item.categoria }}</span>
                  <div class="d-flex align-items-center gap-2" style="width: 60%;">
                    <div class="progress flex-grow-1" style="height: 8px;">
                      <div class="progress-bar bg-primary" [style.width.%]="item.porcentaje"></div>
                    </div>
                    <span class="fw-bold" style="min-width: 60px; text-align: right;">{{ item.conteo | number }}</span>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      </div>

      <div class="row g-4">
        <div class="col-lg-6">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white">
              <h6 class="mb-0 fw-bold">Nivel de Riesgo</h6>
            </div>
            <div class="card-body">
              @for (item of data()!.nivel_riesgo; track item.categoria) {
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <span class="badge" [ngClass]="getRiesgoColor(item.categoria)">{{ item.categoria }}</span>
                  <div class="d-flex align-items-center gap-2" style="width: 60%;">
                    <div class="progress flex-grow-1" style="height: 8px;">
                      <div class="progress-bar" [style.width.%]="item.porcentaje" [ngClass]="getRiesgoBarColor(item.categoria)"></div>
                    </div>
                    <span class="fw-bold" style="min-width: 60px; text-align: right;">{{ item.conteo | number }}</span>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>

        <div class="col-lg-6">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white">
              <h6 class="mb-0 fw-bold">Métricas del Sistema</h6>
            </div>
            <div class="card-body">
              <div class="d-flex justify-content-between py-3 border-bottom">
                <span class="text-muted">Score Promedio</span>
                <span class="fw-bold">{{ data()!.srf_stats.promedio }}</span>
              </div>
              <div class="d-flex justify-content-between py-3 border-bottom">
                <span class="text-muted">Contribuyentes con CIIU</span>
                <span class="fw-bold">{{ data()!.cobertura_ciiu.nits_con_ciiu | number }}</span>
              </div>
              <div class="d-flex justify-content-between py-3 border-bottom">
                <span class="text-muted">Tokens Input (LLM)</span>
                <span class="fw-bold">{{ data()!.volumen_analisis.tokens_input | number }}</span>
              </div>
              <div class="d-flex justify-content-between py-3">
                <span class="text-muted">Tokens Output (LLM)</span>
                <span class="fw-bold">{{ data()!.volumen_analisis.tokens_output | number }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);

  data = signal<DashboardData | null>(null);
  loading = signal(true);

  ngOnInit(): void {
    this.dashboardService.getDashboard().subscribe({
      next: (data) => { this.data.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  formatNumber(n: number): string {
    if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
    return n.toString();
  }

  procesosPorEstado(): { estado: string; cantidad: number; porcentaje: number; color: string }[] {
    const d = this.data();
    if (!d) return [];
    const total = d.total_procesos || 1;
    const map: Record<string, string> = {
      COMPLETADO: 'bg-success',
      EN_PROCESO: 'bg-warning',
      ERROR: 'bg-danger',
      PENDIENTE: 'bg-info',
      CANCELADO: 'bg-secondary',
    };
    return Object.entries(d.procesos_por_estado)
      .filter(([_, v]) => v > 0)
      .map(([estado, cantidad]) => ({
        estado,
        cantidad,
        porcentaje: (cantidad / total) * 100,
        color: map[estado] || 'bg-secondary',
      }));
  }

  getClasificacionColor(cat: string): string {
    const map: Record<string, string> = { OMISO: 'bg-warning text-dark', EXACTO: 'bg-success', INEXACTO: 'bg-danger' };
    return map[cat] || 'bg-secondary';
  }

  getRiesgoColor(cat: string): string {
    const map: Record<string, string> = { BAJO: 'bg-success', MEDIO: 'bg-warning text-dark', ALTO: 'bg-danger' };
    return map[cat] || 'bg-secondary';
  }

  getRiesgoBarColor(cat: string): string {
    const map: Record<string, string> = { BAJO: 'bg-success', MEDIO: 'bg-warning', ALTO: 'bg-danger' };
    return map[cat] || 'bg-secondary';
  }
}
