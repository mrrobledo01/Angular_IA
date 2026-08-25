import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ProcesoFiscalizacionService } from '../../../core/services/proceso-fiscalizacion.service';
import { CrearProcesoRequest, TipoRegimen, TipoProceso } from '../../../core/models/proceso.model';

@Component({
  selector: 'app-proceso-crear',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, PageHeaderComponent],
  template: `
    <app-page-header title="Crear Análisis de Contribuyente" backRoute="/procesos" [breadcrumb]="[{ label: 'Fiscalización', route: '/procesos' }, { label: 'Crear Análisis de Contribuyente' }]" />

    <div class="card border-0 shadow-sm" style="max-width: 900px;">
      <div class="card-body p-4">
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="row g-3">
            <input type="hidden" formControlName="entidad_nit" />
            <div class="col-md-6">
              <label class="form-label">Nombre *</label>
              <input type="text" class="form-control" formControlName="nombre" placeholder="Campaña ICA 2024" />
            </div>
            <div class="col-md-6">
              <label class="form-label">Periodo *</label>
              <select class="form-select" formControlName="periodo">
                <option value="">Seleccione periodo</option>
                @for (p of periodos; track p.valor) {
                  <option [value]="p.valor">{{ p.label }}</option>
                }
              </select>
            </div>
            <div class="col-md-6">
              <label class="form-label">Tipo de Análisis</label>
              <select class="form-select" formControlName="tipo">
                <option value="BASICO">Determinístico</option>
                <option value="COMPLETO">Análisis 360</option>
              </select>
            </div>
            <div class="col-md-6">
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
              <input type="date" class="form-control fw-bold" formControlName="vigencia_ini" readonly />
            </div>
            <div class="col-md-6">
              <label class="form-label">Vigencia Fin *</label>
              <input type="date" class="form-control fw-bold" formControlName="vigencia_fin" readonly />
            </div>
            <div class="col-md-6">
              <label class="form-label">Actividades Económicas (CIIU)</label>
              <input type="text" class="form-control" formControlName="actividades_input" placeholder="Ej: 4711,4712 (separar por coma)" />
            </div>
            <div class="col-md-3">
              <label class="form-label">Máx. NITs</label>
              <input type="number" class="form-control" formControlName="max_nits" placeholder="0 = ilimitado" />
            </div>
            <div class="col-md-3">
              <label class="form-label">Umbral Retenciones %</label>
              <input type="number" class="form-control" formControlName="umbral_retenciones_pct" placeholder="0 = sin umbral" />
            </div>
          </div>

          <div class="d-flex justify-content-end gap-2 mt-4">
            <a routerLink="/procesos" class="btn btn-outline-secondary">Cancelar</a>
            <button type="submit" class="btn btn-primary" [disabled]="form.invalid || saving()">
              @if (saving()) { <span class="spinner-border spinner-border-sm me-1"></span> }
              Crear Análisis
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class ProcesoCrearComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private service = inject(ProcesoFiscalizacionService);
  private router = inject(Router);

  private static readonly ANIOS = Array.from({ length: 2026 - 2000 + 1 }, (_, i) => 2000 + i);

  saving = signal(false);
  periodos = ProcesoCrearComponent.ANIOS.map((anio) => ({
    valor: String(anio),
    label: String(anio),
  }));

  private periodoSub: Subscription | null = null;

  form: FormGroup = this.fb.group({
    entidad_nit: ['8000989118', Validators.required],
    nombre: ['', Validators.required],
    periodo: ['', Validators.required],
    tipo: ['BASICO'],
    tipo_regimen: ['TODOS'],
    vigencia_ini: ['', Validators.required],
    vigencia_fin: ['', Validators.required],
    actividades_input: [''],
    max_nits: [0],
    umbral_retenciones_pct: [0],
  });

  ngOnInit(): void {
    this.periodoSub = this.form.get('periodo')!.valueChanges.subscribe((valor) => {
      this.onPeriodoChange(valor);
    });
  }

  ngOnDestroy(): void {
    this.periodoSub?.unsubscribe();
  }

  onPeriodoChange(valor: string): void {
    const vigenciaIni = this.form.get('vigencia_ini')!;
    const vigenciaFin = this.form.get('vigencia_fin')!;

    if (!valor) {
      vigenciaIni.setValue('');
      vigenciaFin.setValue('');
      return;
    }

    const anio = Number(valor);
    const formatear = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    vigenciaIni.setValue(formatear(new Date(anio, 0, 1)));
    vigenciaFin.setValue(formatear(new Date(anio, 11, 31)));
  }

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
      actividades_economicas: (f.actividades_input || '').split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0),
      max_nits: f.max_nits || 0,
      umbral_retenciones_pct: f.umbral_retenciones_pct || 0,
    };

    this.service.crear(data).subscribe({
      next: (res) => {
        Swal.fire({
          icon: 'success',
          title: 'Análisis Registrado Exitosamente',
          html: `Nombre: ${data.nombre} — Estado: ${res.estado}`,
          confirmButtonText: 'Aceptar',
          width: '28rem',
        });
        this.router.navigate(['/procesos']);
      },
      error: () => {
        this.saving.set(false);
        Swal.fire({
          icon: 'error',
          title: 'Error al registrar el análisis',
          text: 'No fue posible crear el análisis. Intente nuevamente.',
          confirmButtonText: 'Aceptar',
          width: '28rem',
        });
      },
    });
  }
}
