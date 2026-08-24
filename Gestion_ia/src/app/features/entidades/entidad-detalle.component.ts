import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { EntidadFiscalizadoraService } from '../../../core/services/entidad-fiscalizadora.service';
import { EntidadFiscalizadora } from '../../../core/models/entidad.model';

@Component({
  selector: 'app-entidad-detalle',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, LoadingSpinnerComponent],
  template: `
    <app-page-header [title]="entidad()?.nombre || 'Detalle de Entidad'" backRoute="/entidades" [breadcrumb]="[{ label: 'Fiscalización', route: '/entidades' }, { label: entidad()?.nombre || 'Detalle' }]" />

    @if (loading()) {
      <app-loading-spinner message="Cargando entidad..."></app-loading-spinner>
    } @else if (entidad()) {
      <div class="card border-0 shadow-sm" style="max-width: 600px;">
        <div class="card-body p-4">
          <div class="d-flex justify-content-between py-3 border-bottom">
            <span class="text-muted">NIT</span>
            <span class="fw-bold">{{ entidad()!.entidad_nit }}</span>
          </div>
          <div class="d-flex justify-content-between py-3 border-bottom">
            <span class="text-muted">Nombre</span>
            <span class="fw-bold">{{ entidad()!.nombre }}</span>
          </div>
          <div class="d-flex justify-content-between py-3">
            <span class="text-muted">Email</span>
            <span class="fw-bold">{{ entidad()!.email }}</span>
          </div>
        </div>
      </div>
    }
  `,
})
export class EntidadDetalleComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private service = inject(EntidadFiscalizadoraService);

  entidad = signal<EntidadFiscalizadora | null>(null);
  loading = signal(true);

  ngOnInit(): void {
    const nit = this.route.snapshot.paramMap.get('nit')!;
    this.service.obtener(nit).subscribe({
      next: (data) => { this.entidad.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
