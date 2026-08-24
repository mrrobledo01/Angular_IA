import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { MapaUbicacionesComponent } from '../../shared/components/mapa-ubicaciones/mapa-ubicaciones.component';
// import { RiskThermometerComponent } from '../../shared/components/risk-thermometer/risk-thermometer.component';
import { RiskGaugeComponent } from '../../shared/components/risk-gauge/risk-gauge.component';
import { AnalisisIndividualService } from '../../../core/services/analisis-individual.service';
import { GeorreferenciacionService } from '../../../core/services/georreferenciacion.service';
import { AnalisisIndividualResponse } from '../../../core/models/analisis.model';
import { PuntoGeorreferenciado } from '../../../core/models/punto-georreferenciado.model';

@Component({
  selector: 'app-analisis-individual',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PageHeaderComponent, LoadingSpinnerComponent, MapaUbicacionesComponent, RiskGaugeComponent],
  template: `
    <app-page-header title="Análisis Individual" [breadcrumb]="[{ label: 'Fiscalización' }, { label: 'Análisis Individual' }]" />

    <div class="card border-0 shadow-sm" style="max-width: 700px;">
      <div class="card-body p-4">
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="row g-3 align-items-end">
            <div class="col-md-5">
              <label class="form-label">NIT del Contribuyente</label>
              <input type="text" class="form-control" formControlName="nit" placeholder="Ej: 900123456" />
            </div>
            <div class="col-md-4">
              <label class="form-label">Periodo</label>
              <input type="text" class="form-control" formControlName="periodo" placeholder="2024 (opcional)" />
            </div>
            <div class="col-md-3">
              <button type="submit" class="btn btn-primary w-100" [disabled]="form.invalid || analyzing()">
                @if (analyzing()) {
                  <span class="spinner-border spinner-border-sm me-1"></span> Analizando...
                } @else {
                  <i class="bi bi-graph-up me-1"></i> Analizar
                }
              </button>
            </div>
          </div>
        </form>

        @if (analyzing()) {
          <div class="text-center mt-4">
            <p class="text-muted">El análisis puede tardar hasta 90 segundos...</p>
            <div class="progress" style="height: 4px;">
              <div class="progress-bar progress-bar-striped progress-bar-animated" style="width: 100%"></div>
            </div>
          </div>
        }
      </div>
    </div>

    @if (resultado()) {
      <ul class="nav nav-tabs mt-4">
        <li class="nav-item">
          <button class="nav-link" [class.active]="activeTab === 'resumen'" (click)="activeTab = 'resumen'">Resumen</button>
        </li>
        <li class="nav-item">
          <button class="nav-link" [class.active]="activeTab === 'ubicacion'" (click)="activeTab = 'ubicacion'; cargarUbicacion()">
            <i class="bi bi-geo-alt me-1"></i> Ubicación
          </button>
        </li>
      </ul>

      @if (activeTab === 'resumen') {
        <div class="card border-0 shadow-sm rounded-top-0">
          <div class="card-header bg-white d-flex justify-content-between align-items-center">
            <h6 class="mb-0 fw-bold">{{ resultado()!.razon_social }} — {{ resultado()!.contribuyente_nit }}</h6>
            <span class="badge" [ngClass]="resultado()!.clasificacion === 'OMISO' ? 'bg-warning text-dark' : resultado()!.clasificacion === 'EXACTO' ? 'bg-success' : 'bg-danger'">
              {{ resultado()!.clasificacion }}
            </span>
          </div>
          <div class="card-body">
            <div class="row g-3 mb-4">
              <div class="col-md-3">
                <div class="text-muted small">SRF Total</div>
                <div class="fw-bold fs-5">{{ resultado()!.srf_total }}</div>
              </div>
              <div class="col-md-5">
                <div class="text-muted small">Nivel Riesgo</div>
                <!-- <app-risk-thermometer [nivel]="resultado()!.nivel_riesgo" /> -->
                <app-risk-gauge [valor]="resultado()!.srf_total" [nivel]="resultado()!.nivel_riesgo" />
              </div>
              <div class="col-md-4">
                <div class="text-muted small">Modo</div>
                <div class="fw-bold fs-5">{{ resultado()!.modo_degradado ? 'Degradado' : 'Normal' }}</div>
              </div>
            </div>
            @if (resultado()!.componentes_srf?.length) {
              <h6>Componentes SRF</h6>
              <div class="table-responsive mb-4">
                <table class="table table-sm">
                  <thead><tr><th>Componente</th><th class="text-end">Valor</th><th class="text-end">Peso</th></tr></thead>
                  <tbody>
                    @for (c of resultado()!.componentes_srf!; track c.nombre) {
                      <tr><td>{{ c.nombre }}</td><td class="text-end">{{ c.valor }}</td><td class="text-end">{{ c.peso }}</td></tr>
                    }
                  </tbody>
                </table>
              </div>
            }
            <h6>Explicación IA</h6>
            <p class="text-muted">{{ resultado()!.explicacion_ia }}</p>
            @if (resultado()!.hallazgos?.length > 0) {
              <h6>Hallazgos</h6>
              <pre class="bg-light p-3 rounded mb-0" style="font-size: 13px;">{{ resultado()!.hallazgos | json }}</pre>
            }
          </div>
        </div>
      }

      @if (activeTab === 'ubicacion') {
        <div class="card border-0 shadow-sm rounded-top-0">
          <div class="card-body">
            @if (loadingGeo()) {
              <app-loading-spinner message="Cargando ubicaciones..."></app-loading-spinner>
            } @else {
              <app-mapa-ubicaciones [puntos]="puntosGeo()" />
            }
          </div>
        </div>
      }
    }
  `,
})
export class AnalisisIndividualComponent {
  private fb = inject(FormBuilder);
  private service = inject(AnalisisIndividualService);
  private geoService = inject(GeorreferenciacionService);

  form: FormGroup = this.fb.group({
    nit: ['', Validators.required],
    periodo: [''],
  });

  analyzing = signal(false);
  resultado = signal<AnalisisIndividualResponse | null>(null);
  activeTab = 'resumen';
  loadingGeo = signal(false);
  puntosGeo = signal<PuntoGeorreferenciado[]>([]);

  onSubmit(): void {
    if (this.form.invalid) return;
    this.analyzing.set(true);
    this.resultado.set(null);
    this.puntosGeo.set([]);
    this.activeTab = 'resumen';
    const { nit, periodo } = this.form.value;
    this.service.analizar(nit, periodo || undefined).subscribe({
      next: (res) => { this.resultado.set(res); this.analyzing.set(false); },
      error: () => this.analyzing.set(false),
    });
  }

  cargarUbicacion(): void {
    const nit = this.resultado()?.contribuyente_nit;
    if (!nit || this.puntosGeo().length > 0) return;
    this.loadingGeo.set(true);
    this.geoService.obtenerPuntos(nit).subscribe({
      next: (puntos) => { this.puntosGeo.set(puntos); this.loadingGeo.set(false); },
      error: () => { this.puntosGeo.set([]); this.loadingGeo.set(false); },
    });
  }
}
