import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { ReglasFiscalizacionService } from '../../../core/services/reglas-fiscalizacion.service';
import { HallazgosService } from '../../../core/services/hallazgos.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ReglasEvaluarRequest, ReglaFiscalizacion, Hallazgo } from '../../../core/models/hallazgo.model';

@Component({
  selector: 'app-reglas-fiscalizacion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PageHeaderComponent, StatusBadgeComponent],
  template: `
    <app-page-header title="Reglas de Fiscalización y Hallazgos" [breadcrumb]="[{ label: 'Fiscalización' }, { label: 'Reglas y Hallazgos' }]" />

    <div class="row g-4">
      <div class="col-lg-5">
        <div class="card border-0 shadow-sm">
          <div class="card-body p-4">
            <h6 class="fw-bold mb-4">Evaluar / Ejecutar Reglas</h6>
            <form [formGroup]="form" (ngSubmit)="evaluar()">
              <div class="mb-3">
                <label class="form-label">NIT Contribuyente</label>
                <input type="text" class="form-control" formControlName="contribuyente_nit" placeholder="Ej: 1000522206" />
              </div>
              <div class="mb-3">
                <label class="form-label">Periodo</label>
                <input type="text" class="form-control" formControlName="periodo" placeholder="2026" />
              </div>
              <div class="mb-4">
                <label class="form-label">Reglas (R1-R10)</label>
                <div class="d-flex flex-wrap gap-3">
                  @for (regla of reglasDisponibles; track regla) {
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" [checked]="reglasSeleccionadas().includes(regla)" (change)="toggleRegla(regla)" [id]="'r-' + regla" />
                      <label class="form-check-label" [for]="'r-' + regla">{{ regla }}</label>
                    </div>
                  }
                </div>
              </div>
              <div class="d-flex justify-content-end gap-2">
                <button type="button" class="btn btn-outline-warning" (click)="ejecutar()" [disabled]="form.invalid || executing()">
                  @if (executing()) { <span class="spinner-border spinner-border-sm me-1"></span> }
                  Ejecutar (Persistir)
                </button>
                <button type="submit" class="btn btn-primary" [disabled]="form.invalid || evaluating()">
                  @if (evaluating()) { <span class="spinner-border spinner-border-sm me-1"></span> }
                  Evaluar (Simulación)
                </button>
              </div>
            </form>

            @if (resultadoReglas()) {
              <div class="mt-4 pt-4 border-top">
                <h6 class="fw-bold">Resultado — {{ resultadoReglas()!.total }} reglas evaluadas</h6>
                <pre class="bg-light p-3 rounded mb-0" style="font-size: 12px; max-height: 300px; overflow: auto;">{{ resultadoReglas()!.resultados | json }}</pre>
              </div>
            }
          </div>
        </div>
      </div>

      <div class="col-lg-7">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-white d-flex justify-content-between align-items-center">
            <h6 class="fw-bold mb-0">Hallazgos Detectados</h6>
            <div class="d-flex gap-2">
              <span class="badge bg-primary">{{ hallazgos().length }} hallazgos</span>
              <button class="btn btn-sm btn-outline-primary" (click)="loadHallazgos()" [disabled]="loadingHallazgos()">
                <i class="bi bi-arrow-clockwise"></i>
              </button>
            </div>
          </div>
          <div class="card-body p-0">
            @if (loadingHallazgos()) {
              <div class="text-center py-4"><div class="spinner-border spinner-border-sm text-primary"></div></div>
            } @else if (errorHallazgos()) {
              <div class="alert alert-warning m-3 mb-0">
                <i class="bi bi-exclamation-triangle me-2"></i>
                {{ errorHallazgos() }}
              </div>
            } @else if (hallazgos().length === 0) {
              <p class="text-center text-muted py-4 mb-0">No hay hallazgos registrados</p>
            } @else {
              <div class="table-responsive">
                <table class="table table-hover mb-0">
                  <thead class="bg-light">
                    <tr>
                      <th>NIT</th>
                      <th>Regla</th>
                      <th>Tipo</th>
                      <th>Score</th>
                      <th>Estado</th>
                      <th>Periodo</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (h of hallazgos(); track h.id) {
                      <tr>
                        <td class="fw-bold">{{ h.contribuyente_nit }}</td>
                        <td><span class="badge bg-secondary">{{ h.regla }}</span></td>
                        <td><span class="badge bg-info text-dark">{{ h.tipo_hallazgo }}</span></td>
                        <td>{{ h.score }}</td>
                        <td><app-status-badge [status]="h.estado" /></td>
                        <td>{{ h.periodo }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ReglasFiscalizacionComponent {
  private fb = inject(FormBuilder);
  private reglasService = inject(ReglasFiscalizacionService);
  private hallazgosService = inject(HallazgosService);
  private notification = inject(NotificationService);

  form: FormGroup = this.fb.group({
    contribuyente_nit: ['', Validators.required],
    periodo: ['', Validators.required],
  });

  reglasDisponibles: ReglaFiscalizacion[] = ['R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7', 'R8', 'R9', 'R10'];
  reglasSeleccionadas = signal<ReglaFiscalizacion[]>([]);
  evaluating = signal(false);
  executing = signal(false);
  resultadoReglas = signal<{ total: number; resultados: any[] } | null>(null);
  hallazgos = signal<Hallazgo[]>([]);
  loadingHallazgos = signal(true);
  errorHallazgos = signal('');

  constructor() { this.loadHallazgos(); }

  toggleRegla(regla: ReglaFiscalizacion): void {
    this.reglasSeleccionadas.update((c) => c.includes(regla) ? c.filter((r) => r !== regla) : [...c, regla]);
  }

  private buildRequest(): ReglasEvaluarRequest {
    const { contribuyente_nit, periodo } = this.form.value;
    return {
      contribuyente_nit,
      periodo,
      reglas: this.reglasSeleccionadas().length > 0 ? this.reglasSeleccionadas() : undefined,
    };
  }

  evaluar(): void {
    if (this.form.invalid) return;
    this.evaluating.set(true);
    this.reglasService.evaluar(this.buildRequest()).subscribe({
      next: (res) => { this.resultadoReglas.set(res); this.evaluating.set(false); },
      error: () => this.evaluating.set(false),
    });
  }

  ejecutar(): void {
    if (this.form.invalid) return;
    this.executing.set(true);
    this.reglasService.ejecutar(this.buildRequest()).subscribe({
      next: (res) => {
        this.executing.set(false);
        this.notification.success('Ejecutado', `Se generaron ${Array.isArray(res) ? res.length : 0} hallazgos`);
        this.loadHallazgos();
      },
      error: () => this.executing.set(false),
    });
  }

  loadHallazgos(): void {
    this.loadingHallazgos.set(true);
    this.errorHallazgos.set('');
    this.hallazgosService.listar({ page: 1, page_size: 50 }).subscribe({
      next: (res) => {
        this.hallazgos.set(res.resultados || []);
        this.loadingHallazgos.set(false);
      },
      error: (err) => {
        this.hallazgos.set([]);
        this.loadingHallazgos.set(false);
        this.errorHallazgos.set('Error al cargar hallazgos desde el servidor. El endpoint puede estar temporalmente no disponible.');
      },
    });
  }
}
