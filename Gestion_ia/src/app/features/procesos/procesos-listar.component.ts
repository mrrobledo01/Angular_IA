import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { ProcesoFiscalizacionService } from '../../../core/services/proceso-fiscalizacion.service';
import { ProcesoHeader } from '../../../core/models/proceso.model';

@Component({
  selector: 'app-procesos-listar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, PageHeaderComponent, StatusBadgeComponent, EmptyStateComponent, LoadingSpinnerComponent],
  template: `
    <app-page-header title="Proceso de análisis de contribuyente" [breadcrumb]="[{ label: 'Fiscalización' }, { label: 'Proceso de análisis de contribuyente' }]">
      <a routerLink="/procesos/crear" class="btn btn-primary">
        <i class="bi bi-plus-lg me-1"></i> Nuevo Análisis
      </a>
    </app-page-header>

    <div class="card border-0 shadow-sm mb-4">
      <div class="card-body">
        <div class="row g-3 align-items-end">
          <div class="col-md-8">
            <label class="form-label">NIT de la Entidad</label>
            <input type="text" class="form-control" [(ngModel)]="entidadNit" placeholder="Ej: 900000000" (keyup.enter)="buscar()" />
          </div>
          <div class="col-md-4">
            <button class="btn btn-primary" (click)="buscar()" [disabled]="!entidadNit.trim() || loading()">
              @if (loading()) { <span class="spinner-border spinner-border-sm me-1"></span> }
              <i class="bi bi-search me-1"></i> Buscar
            </button>
          </div>
        </div>
      </div>
    </div>

    @if (loading()) {
      <app-loading-spinner message="Cargando procesos..."></app-loading-spinner>
    } @else if (buscado()) {
      @if (procesos().length === 0) {
        <app-empty-state icon="bi-file-earmark-text" title="Sin procesos" [message]="'No se encontraron procesos para la entidad ' + entidadNit" />
      } @else {
        <div class="card border-0 shadow-sm">
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead class="bg-light">
                  <tr>
                    <th>Nombre</th>
                    <th>Candidatos</th>
                    <th>Omisos</th>
                    <th>Exactos</th>
                    <th>Inexactos</th>
                    <th>Intentos</th>
                    <th>Estado</th>
                    <th class="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  @for (p of procesos(); track p.proceso_id) {
                    <tr>
                      <td>{{ p.nombre }}</td>
                      <td>{{ p.candidatos }}</td>
                      <td>{{ p.omisos }}</td>
                      <td>{{ p.exactos }}</td>
                      <td>{{ p.inexactos }}</td>
                      <td>{{ p.intentos_total }}</td>
                      <td><app-status-badge [status]="p.estado" /></td>
                      <td class="text-end">
                        <a [routerLink]="['/procesos', p.proceso_id]" class="btn btn-sm btn-outline-primary me-1" title="Ver detalle">
                          <i class="bi bi-eye"></i>
                        </a>
                        <button class="btn btn-sm btn-outline-success" (click)="descargar(p.proceso_id)" [disabled]="downloadingId() === p.proceso_id" title="Descargar XLSX">
                          @if (downloadingId() === p.proceso_id) {
                            <span class="spinner-border spinner-border-sm"></span>
                          } @else {
                            <i class="bi bi-download"></i>
                          }
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      }
    } @else {
      <app-empty-state icon="bi-search" title="Buscar procesos" message="Ingrese el NIT de una entidad para ver sus procesos de fiscalización." />
    }
  `,
})
export class ProcesosListarComponent {
  private service = inject(ProcesoFiscalizacionService);

  entidadNit = '';
  procesos = signal<ProcesoHeader[]>([]);
  loading = signal(false);
  buscado = signal(false);
  downloadingId = signal<string | null>(null);

  buscar(): void {
    const nit = this.entidadNit.trim();
    if (!nit) return;
    this.loading.set(true);
    this.buscado.set(true);
    this.service.listar(nit, 1, 50).subscribe({
      next: (res) => { this.procesos.set(res.resultados); this.loading.set(false); },
      error: () => { this.procesos.set([]); this.loading.set(false); },
    });
  }

  descargar(procesoId: string): void {
    this.downloadingId.set(procesoId);
    this.service.exportar(procesoId, 'xlsx').subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `proceso_${procesoId}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.downloadingId.set(null);
      },
      error: () => this.downloadingId.set(null),
    });
  }
}
