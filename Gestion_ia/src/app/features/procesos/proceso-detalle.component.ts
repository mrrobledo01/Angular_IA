import { Component, OnInit, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { interval, switchMap, takeWhile, Subscription } from 'rxjs';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { ProcesoFiscalizacionService } from '../../../core/services/proceso-fiscalizacion.service';
import { ProcesoHeader, ProcesoResultado, ProcesoError } from '../../../core/models/proceso.model';

@Component({
  selector: 'app-proceso-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent, StatusBadgeComponent, LoadingSpinnerComponent],
  template: `
    <app-page-header [title]="proceso()?.nombre || 'Detalle de Proceso'" backRoute="/procesos" [breadcrumb]="[{ label: 'Fiscalización', route: '/procesos' }, { label: proceso()?.nombre || 'Detalle' }]">
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
        this.progresoTotal.set(res.progreso?.total || 0);
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
        this.progresoTotal.set(res.progreso?.total || 0);
      },
    });
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
