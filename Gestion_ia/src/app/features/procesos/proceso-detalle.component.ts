import { Component, OnInit, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { interval, switchMap, takeWhile, Subscription } from 'rxjs';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { ProcesoFiscalizacionService } from '../../../core/services/proceso-fiscalizacion.service';
import { ProcesoHeader, ProcesoResultado, ProcesoError, ProcesoStatusResponse } from '../../../core/models/proceso.model';

@Component({
  selector: 'app-proceso-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent, StatusBadgeComponent, LoadingSpinnerComponent],
  template: `
    <app-page-header [title]="proceso()?.nombre || 'Detalle Análisis Contribuyente'" backRoute="/procesos" [breadcrumb]="[{ label: 'Fiscalización', route: '/procesos' }, { label: proceso()?.nombre || 'Detalle Análisis Contribuyente' }]">
      <button class="btn btn-outline-primary" (click)="exportar()" [disabled]="!proceso()">
        <i class="bi bi-download me-1"></i> Exportar XLSX
      </button>
      @if (proceso()?.estado !== 'COMPLETADO' && proceso()?.estado !== 'CANCELADO') {
        <button class="btn btn-outline-danger" (click)="cancelar()">
          <i class="bi bi-x-circle me-1"></i> Cancelar
        </button>
      }
    </app-page-header>

    @if (loading()) {
      <app-loading-spinner message="Cargando proceso..."></app-loading-spinner>
    } @else if (proceso()) {
      <ul class="nav nav-tabs mb-4">
        <li class="nav-item">
          <button class="nav-link" [class.active]="activeTab === 'info'" (click)="activeTab = 'info'">Información</button>
        </li>
        <li class="nav-item">
          <button class="nav-link" [class.active]="activeTab === 'estado'" (click)="activeTab = 'estado'">Estado</button>
        </li>
        <li class="nav-item">
          <button class="nav-link" [class.active]="activeTab === 'resultados'" (click)="activeTab = 'resultados'">Resultados</button>
        </li>
        <li class="nav-item">
          <button class="nav-link" [class.active]="activeTab === 'errores'" (click)="activeTab = 'errores'">Errores</button>
        </li>
      </ul>

      @if (activeTab === 'info') {
        <div class="card border-0 shadow-sm" style="max-width: 600px;">
          <div class="card-body">
            <div class="d-flex justify-content-between py-3 border-bottom">
              <span class="text-muted">ID</span>
              <span class="fw-bold">{{ proceso()!.proceso_id }}</span>
            </div>
            <div class="d-flex justify-content-between py-3 border-bottom">
              <span class="text-muted">Estado</span>
              <app-status-badge [status]="proceso()!.estado" />
            </div>
            <div class="d-flex justify-content-between py-3 border-bottom">
              <span class="text-muted">Entidad</span>
              <span class="fw-bold">{{ proceso()!.entidad_nit }}</span>
            </div>
            <div class="d-flex justify-content-between py-3">
              <span class="text-muted">Periodo</span>
              <span class="fw-bold">{{ proceso()!.periodo }}</span>
            </div>
          </div>
        </div>
      }

      @if (activeTab === 'estado') {
        <div class="card border-0 shadow-sm">
          <div class="card-body text-center py-5">
            <div class="progress mb-3" style="height: 8px;">
              <div class="progress-bar" role="progressbar" [style.width.%]="progresoPorcentaje()"></div>
            </div>
            <h3 class="fw-bold">{{ progresoPorcentaje() }}%</h3>
            <p class="text-muted">{{ progresoProcesados() }} / {{ progresoTotal() }} registros procesados</p>
          </div>
        </div>
      }

      @if (activeTab === 'resultados') {
        <div class="row g-4 mb-4">
          <div class="col-lg-4">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-header bg-white">
                <h6 class="mb-0 fw-bold">Clasificación</h6>
              </div>
              <div class="card-body d-flex align-items-center justify-content-center">
                <div class="donut" [style.background]="donutStyle()">
                  <div class="donut-hole">
                    <div class="fw-bold fs-4">{{ totalNits() }}</div>
                    <div class="text-muted small">NITs</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-lg-8">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-header bg-white">
                <h6 class="mb-0 fw-bold">Resumen por clasificación</h6>
              </div>
              <div class="card-body">
                @for (c of clasificacion(); track c.categoria) {
                  <div class="d-flex justify-content-between align-items-center mb-3">
                    <span class="badge" [ngClass]="c.badge">{{ c.categoria }}</span>
                    <div class="d-flex align-items-center gap-2" style="width: 65%;">
                      <div class="progress flex-grow-1" style="height: 10px;">
                        <div class="progress-bar" [ngClass]="c.bar" [style.width.%]="c.porcentaje"></div>
                      </div>
                      <span class="fw-bold" style="min-width: 40px; text-align: right;">{{ c.total }}</span>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>

        <div class="mb-3">
          <select class="form-select" style="max-width: 250px;" [(ngModel)]="resultadosClasificacion" (ngModelChange)="loadResultados()">
            <option value="">Todas las clasificaciones</option>
            <option value="EXACTO">Exacto</option>
            <option value="INEXACTO">Inexacto</option>
            <option value="OMISO">Omiso</option>
          </select>
        </div>
        <div class="card border-0 shadow-sm">
          <div class="card-body p-0">
            <table class="table table-hover mb-0">
              <thead class="bg-light">
                <tr><th>NIT</th><th>Razón Social</th><th>Clasificación</th></tr>
              </thead>
              <tbody>
                @for (r of resultados(); track r.contribuyente_nit) {
                  <tr>
                    <td>{{ r.contribuyente_nit }}</td>
                    <td>{{ r.razon_social }}</td>
                    <td><app-status-badge [status]="r.clasificacion" /></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      @if (activeTab === 'errores') {
        <div class="card border-0 shadow-sm">
          <div class="card-body p-0">
            <table class="table table-hover mb-0">
              <thead class="bg-light">
                <tr><th>NIT</th><th>Capa</th><th>Mensaje</th><th>Fecha</th></tr>
              </thead>
              <tbody>
                @for (e of errores(); track e.id) {
                  <tr>
                    <td>{{ e.nit }}</td>
                    <td><span class="badge bg-secondary">{{ e.capa }}</span></td>
                    <td>{{ e.mensaje }}</td>
                    <td>{{ e.fecha | date:'dd/MM/yyyy HH:mm' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    }
  `,
  styles: [`
    .donut {
      width: 180px;
      height: 180px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .donut-hole {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: white;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
  `],
})
export class ProcesoDetalleComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private service = inject(ProcesoFiscalizacionService);

  proceso = signal<ProcesoHeader | null>(null);
  resultados = signal<ProcesoResultado[]>([]);
  errores = signal<ProcesoError[]>([]);
  loading = signal(true);
  resultadosClasificacion = '';
  activeTab = 'info';

  progresoPorcentaje = signal(0);
  progresoProcesados = signal(0);
  progresoTotal = signal(0);

  totalNits = signal(0);
  clasificacion = signal<{ categoria: string; total: number; porcentaje: number; badge: string; bar: string; color: string }[]>([]);

  private pollingSub?: Subscription;
  private procesoId = '';

  ngOnInit(): void {
    this.procesoId = this.route.snapshot.paramMap.get('id') || '';
    this.load();
    this.startPolling();
  }

  ngOnDestroy(): void { this.pollingSub?.unsubscribe(); }

  load(): void {
    this.loading.set(true);
    this.service.obtenerEstado(this.procesoId).subscribe({
      next: (res) => {
        this.proceso.set({
          proceso_id: this.procesoId,
          entidad_nit: '',
          nombre: '',
          estado: res.estado,
          fecha_creacion: '',
        });
        this.progresoPorcentaje.set(res.progreso?.porcentaje || 0);
        this.progresoProcesados.set(res.progreso?.procesados || 0);
        this.progresoTotal.set(res.progreso?.total_nits || 0);
        this.updateClasificacion(res);
        this.loading.set(false);
        this.loadResultados();
        this.loadErrores();
      },
      error: () => this.loading.set(false),
    });
  }

  loadResultados(): void {
    this.service.obtenerResultados(this.procesoId, { clasificacion: this.resultadosClasificacion || undefined }).subscribe({
      next: (res) => this.resultados.set(res.resultados || []),
    });
  }

  loadErrores(): void {
    this.service.obtenerErrores(this.procesoId).subscribe({
      next: (res) => this.errores.set(res.errores_detalle || []),
    });
  }

  private startPolling(): void {
    this.pollingSub = interval(5000).pipe(
      switchMap(() => this.service.obtenerEstado(this.procesoId)),
      takeWhile((res) => !['COMPLETADO', 'CANCELADO', 'ERROR'].includes(res.estado)),
    ).subscribe({
      next: (res) => {
        this.proceso.update((p) => p ? { ...p, estado: res.estado } : p);
        this.progresoPorcentaje.set(res.progreso?.porcentaje || 0);
        this.progresoProcesados.set(res.progreso?.procesados || 0);
        this.progresoTotal.set(res.progreso?.total_nits || 0);
        this.updateClasificacion(res);
      },
    });
  }

  private updateClasificacion(res: ProcesoStatusResponse): void {
    const cl = res.clasificacion || {};
    const totalNits = res.progreso?.total_nits || 0;
    const omisos = cl['omisos']?.total || 0;
    const inexactos = cl['inexactos']?.total || 0;
    const exactos = Math.max(0, totalNits - omisos - inexactos);
    const total = Math.max(totalNits, omisos + inexactos + exactos);

    this.totalNits.set(total);

    const defs = [
      { categoria: 'Omisos', badge: 'bg-warning text-dark', bar: 'bg-warning', color: '#fd7e14' },
      { categoria: 'Inexactos', badge: 'bg-danger', bar: 'bg-danger', color: '#dc3545' },
      { categoria: 'Exactos', badge: 'bg-success', bar: 'bg-success', color: '#198754' },
    ];
    const valores = [omisos, inexactos, exactos];

    this.clasificacion.set(
      defs.map((d, i) => ({
        ...d,
        total: valores[i],
        porcentaje: total > 0 ? (valores[i] / total) * 100 : 0,
      }))
    );
  }

  donutStyle(): string {
    const items = this.clasificacion();
    if (items.every((c) => c.total === 0)) {
      return 'conic-gradient(#e9ecef 0% 100%)';
    }
    let acc = 0;
    const stops = items.map((c) => {
      const start = acc;
      acc += c.porcentaje;
      return `${c.color} ${start}% ${acc}%`;
    });
    return `conic-gradient(${stops.join(', ')})`;
  }

  exportar(): void {
    this.service.exportar(this.procesoId).subscribe({
      next: (blob) => { const url = window.URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `proceso_${this.procesoId}.xlsx`; a.click(); window.URL.revokeObjectURL(url); },
    });
  }

  cancelar(): void {
    if (confirm('¿Está seguro de cancelar este proceso?')) {
      this.service.cancelar(this.procesoId).subscribe({ next: () => this.load() });
    }
  }
}
