import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { AnalisisComportamentalService } from '../../../core/services/analisis-comportamental.service';

@Component({
  selector: 'app-analisis-comportamental',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PageHeaderComponent],
  template: `
    <app-page-header title="Análisis Comportamental" [breadcrumb]="[{ label: 'Fiscalización' }, { label: 'Análisis Comportamental' }]" />

    <div class="card border-0 shadow-sm mb-4">
      <div class="card-body p-4">
        <form [formGroup]="form" (ngSubmit)="buscar()">
          <div class="row g-3 align-items-end">
            <div class="col-md-3">
              <label class="form-label">NIT</label>
              <input type="text" class="form-control" formControlName="nit" placeholder="Ej: 1000522206" />
            </div>
            <div class="col-md-2">
              <label class="form-label">Periodo</label>
              <input type="text" class="form-control" formControlName="periodo" placeholder="2026" />
            </div>
            <div class="col-md-2">
              <label class="form-label">CIIU</label>
              <input type="text" class="form-control" formControlName="ciiu" placeholder="Opcional" />
            </div>
            <div class="col-md-2">
              <label class="form-label">Mín. Pares</label>
              <input type="number" class="form-control" formControlName="min_pares" value="10" />
            </div>
            <div class="col-md-3">
              <button type="submit" class="btn btn-primary" [disabled]="form.invalid || loading()">
                @if (loading()) { <span class="spinner-border spinner-border-sm me-1"></span> }
                <i class="bi bi-search me-1"></i> Buscar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

    @if (loading()) {
      <div class="text-center py-5"><div class="spinner-border text-primary"></div></div>
    }

    @if (comportamiento()) {
      <ul class="nav nav-tabs mb-4">
        <li class="nav-item">
          <button class="nav-link" [class.active]="activeTab === 'comportamiento'" (click)="activeTab = 'comportamiento'">Comportamiento</button>
        </li>
        <li class="nav-item">
          <button class="nav-link" [class.active]="activeTab === 'expediente'" (click)="activeTab = 'expediente'">Expediente Fiscal</button>
        </li>
      </ul>

      @if (activeTab === 'comportamiento' && comportamiento()) {
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <div class="row g-3 mb-4">
              <div class="col-md-3">
                <div class="text-muted small">Score Comportamental</div>
                <div class="fw-bold fs-4">{{ comportamiento()?.score_comportamental }}</div>
              </div>
              <div class="col-md-3">
                <div class="text-muted small">Prioridad</div>
                <div class="fw-bold fs-4">{{ comportamiento()?.prioridad }}</div>
              </div>
              <div class="col-md-3">
                <div class="text-muted small">Confianza</div>
                <div class="fw-bold fs-4">{{ comportamiento()?.confianza }}</div>
              </div>
              <div class="col-md-3">
                <div class="text-muted small">Régimen</div>
                <div class="fw-bold fs-4">{{ comportamiento()?.regimen }}</div>
              </div>
            </div>

            <div class="row g-3 mb-4">
              <div class="col-md-6">
                <div class="text-muted small">Razón Social</div>
                <div class="fw-bold">{{ comportamiento()?.razon_social }}</div>
              </div>
              <div class="col-md-3">
                <div class="text-muted small">CIIU</div>
                <div class="fw-bold">{{ comportamiento()?.ciiu || 'N/A' }}</div>
              </div>
              <div class="col-md-3">
                <div class="text-muted small">Vigencia</div>
                <div class="fw-bold">{{ comportamiento()?.vigencia }}</div>
              </div>
            </div>

            @if (comportamiento()?.metricas) {
              <h6>Métricas</h6>
              <div class="row g-3 mb-4">
                <div class="col-md-3">
                  <div class="text-muted small">Base Gravable</div>
                  <div class="fw-bold">{{ comportamiento()?.metricas?.base_gravable }}</div>
                </div>
                <div class="col-md-3">
                  <div class="text-muted small">Impuesto</div>
                  <div class="fw-bold">{{ comportamiento()?.metricas?.impuesto }}</div>
                </div>
                <div class="col-md-3">
                  <div class="text-muted small">Ingresos Exógena</div>
                  <div class="fw-bold">{{ comportamiento()?.metricas?.ingresos_exogena }}</div>
                </div>
                <div class="col-md-3">
                  <div class="text-muted small">Tarifa Efectiva</div>
                  <div class="fw-bold">{{ comportamiento()?.metricas?.tarifa_efectiva || 'N/A' }}</div>
                </div>
              </div>
            }

            @if (comportamiento()?.desviaciones) {
              <h6>Desviaciones</h6>
              <div class="row g-3 mb-4">
                <div class="col-md-3">
                  <div class="text-muted small">Percentil Base Gravable</div>
                  <div class="fw-bold">{{ comportamiento()?.desviaciones?.percentil_base_gravable }}</div>
                </div>
                <div class="col-md-3">
                  <div class="text-muted small">Variación Mediana %</div>
                  <div class="fw-bold">{{ comportamiento()?.desviaciones?.variacion_mediana_base_pct }}</div>
                </div>
                <div class="col-md-3">
                  <div class="text-muted small">Z-Score Robusto</div>
                  <div class="fw-bold">{{ comportamiento()?.desviaciones?.zscore_robusto_base }}</div>
                </div>
                <div class="col-md-3">
                  <div class="text-muted small">Outlier IQR</div>
                  <div class="fw-bold">{{ comportamiento()?.desviaciones?.outlier_iqr_inferior ? 'Sí' : 'No' }}</div>
                </div>
              </div>
            }

            @if (comportamiento()?.hallazgos?.length > 0) {
              <h6>Hallazgos</h6>
              @for (h of comportamiento()!.hallazgos; track h.tipo) {
                <div class="alert alert-warning py-2 mb-2">
                  <strong>{{ h.tipo }}</strong> ({{ h.severidad }}) — {{ h.descripcion }}
                </div>
              }
            }

            <h6>Explicación</h6>
            <p class="text-muted mb-0">{{ comportamiento()?.explicacion }}</p>
          </div>
        </div>
      }

      @if (activeTab === 'expediente' && expediente()) {
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <div class="row g-3 mb-4">
              <div class="col-md-3">
                <div class="text-muted small">Score Unificado</div>
                <div class="fw-bold fs-4">{{ expediente()?.score_unificado }}</div>
              </div>
              <div class="col-md-9">
                <div class="text-muted small">Resumen Ejecutivo</div>
                <p class="mb-0">{{ expediente()?.resumen_ejecutivo }}</p>
              </div>
            </div>
            @if (expediente()?.markdown) {
              <h6>Detalle</h6>
              <div class="bg-light p-3 rounded" style="font-size: 13px; white-space: pre-wrap;">{{ expediente()?.markdown }}</div>
            }
          </div>
        </div>
      }
    }
  `,
})
export class AnalisisComportamentalComponent {
  private fb = inject(FormBuilder);
  private service = inject(AnalisisComportamentalService);

  form: FormGroup = this.fb.group({
    nit: ['', Validators.required],
    periodo: [''],
    ciiu: [''],
    min_pares: [10],
  });

  loading = signal(false);
  comportamiento = signal<any>(null);
  expediente = signal<any>(null);
  activeTab = 'comportamiento';

  buscar(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.comportamiento.set(null);
    this.expediente.set(null);
    const { nit, periodo, ciiu, min_pares } = this.form.value;

    this.service.obtenerComportamiento(nit, { periodo, ciiu, min_pares }).subscribe({
      next: (data) => { this.comportamiento.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });

    this.service.obtenerExpediente(nit, { periodo, min_pares }).subscribe({
      next: (data) => this.expediente.set(data),
    });
  }
}
