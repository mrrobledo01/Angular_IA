import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ProcesoFiscalizacionService } from '../../../core/services/proceso-fiscalizacion.service';
import { NotificationService } from '../../../core/services/notification.service';
import { CrearProcesoRequest, TipoRegimen, TipoProceso } from '../../../core/models/proceso.model';

@Component({
  selector: 'app-proceso-crear',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, PageHeaderComponent],
  template: `
    <app-page-header title="Crear Proceso de Fiscalización" backRoute="/procesos" [breadcrumb]="[{ label: 'Fiscalización', route: '/procesos' }, { label: 'Crear Proceso' }]" />

    <div class="card border-0 shadow-sm" style="max-width: 900px;">
      <div class="card-body p-4">
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label">NIT Entidad *</label>
              <input type="text" class="form-control" formControlName="entidad_nit" placeholder="Ej: 900000000" />
            </div>
            <div class="col-md-6">
              <label class="form-label">Nombre *</label>
              <input type="text" class="form-control" formControlName="nombre" placeholder="Campaña ICA 2024" />
            </div>
            <div class="col-md-4">
              <label class="form-label">Periodo *</label>
              <input type="text" class="form-control" formControlName="periodo" placeholder="2024" />
            </div>
            <div class="col-md-4">
              <label class="form-label">Tipo</label>
              <select class="form-select" formControlName="tipo">
                <option value="BASICO">Básico</option>
                <option value="COMPLETO">Completo</option>
              </select>
            </div>
            <div class="col-md-4">
              <label class="form-label">Régimen</label>
              <select class="form-select" formControlName="tipo_regimen">
                <option value="TODOS">Todos</option>
                <option value="COMUN">Común</option>
                <option value="SIMPLIFICADO">Simplificado</option>
                <option value="GRAN_CONTRIBUYENTE">Gran Contribuyente</option>
              </select>
            </div>
            <div class="col-md-6">
              <label class="form-label">Vigencia Inicio *</label>
              <input type="date" class="form-control" formControlName="vigencia_ini" />
            </div>
            <div class="col-md-6">
              <label class="form-label">Vigencia Fin *</label>
              <input type="date" class="form-control" formControlName="vigencia_fin" />
            </div>
            <div class="col-md-6">
              <label class="form-label">Actividades Económicas (CIIU) *</label>
              <input type="text" class="form-control" formControlName="actividades_input" placeholder="Ej: 4711,4712 (separar por coma)" />
            </div>
            <div class="col-md-3">
              <label class="form-label">Máx. NITs</label>
              <input type="number" class="form-control" formControlName="max_nits" placeholder="0 = ilimitado" />
            </div>
            <div class="col-md-3">
              <label class="form-label">Umbral Retenciones %</label>
              <input type="number" class="form-control" formControlName="umbral_retenciones_pct" />
            </div>
          </div>

          <div class="d-flex justify-content-end gap-2 mt-4">
            <a routerLink="/procesos" class="btn btn-outline-secondary">Cancelar</a>
            <button type="submit" class="btn btn-primary" [disabled]="form.invalid || saving()">
              @if (saving()) { <span class="spinner-border spinner-border-sm me-1"></span> }
              Crear Proceso
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class ProcesoCrearComponent {
  private fb = inject(FormBuilder);
  private service = inject(ProcesoFiscalizacionService);
  private notification = inject(NotificationService);
  private router = inject(Router);

  saving = signal(false);

  form: FormGroup = this.fb.group({
    entidad_nit: ['', Validators.required],
    nombre: ['', Validators.required],
    periodo: ['', Validators.required],
    tipo: ['BASICO'],
    tipo_regimen: ['TODOS'],
    vigencia_ini: ['', Validators.required],
    vigencia_fin: ['', Validators.required],
    actividades_input: ['', Validators.required],
    max_nits: [0],
    umbral_retenciones_pct: [5],
  });

  onSubmit(): void {
    if (this.form.invalid) return;
    this.saving.set(true);

    const f = this.form.value;
    const data: CrearProcesoRequest = {
      entidad_nit: f.entidad_nit,
      nombre: f.nombre,
      periodo: f.periodo,
      tipo: f.tipo as TipoProceso,
      tipo_regimen: f.tipo_regimen as TipoRegimen,
      vigencia_ini: f.vigencia_ini,
      vigencia_fin: f.vigencia_fin,
      actividades_economicas: f.actividades_input.split(',').map((s: string) => s.trim()),
      max_nits: f.max_nits || 0,
      umbral_retenciones_pct: f.umbral_retenciones_pct || 5,
    };

    this.service.crear(data).subscribe({
      next: (res) => {
        this.notification.success('Proceso creado', `ID: ${res.proceso_id} — Estado: ${res.estado}`);
        this.router.navigate(['/procesos']);
      },
      error: () => this.saving.set(false),
    });
  }
}
