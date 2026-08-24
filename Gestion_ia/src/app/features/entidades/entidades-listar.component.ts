import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { EntidadFiscalizadoraService } from '../../../core/services/entidad-fiscalizadora.service';
import { EntidadFiscalizadora } from '../../../core/models/entidad.model';

@Component({
  selector: 'app-entidades-listar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, PageHeaderComponent, EmptyStateComponent, LoadingSpinnerComponent],
  template: `
    <app-page-header title="Entidades Fiscalizadoras" [breadcrumb]="[{ label: 'Fiscalización' }, { label: 'Entidades' }]">
      <a routerLink="/entidades/crear" class="btn btn-primary">
        <i class="bi bi-plus-lg me-1"></i> Nueva Entidad
      </a>
    </app-page-header>

    <div class="card border-0 shadow-sm mb-4">
      <div class="card-body">
        <div class="row g-3 align-items-end">
          <div class="col-md-8">
            <label class="form-label">NIT de la Entidad</label>
            <input type="text" class="form-control" [(ngModel)]="nitBusqueda" placeholder="Ej: 8000989118" (keyup.enter)="buscar()" />
          </div>
          <div class="col-md-4">
            <button class="btn btn-primary" (click)="buscar()" [disabled]="!nitBusqueda.trim() || loading()">
              @if (loading()) { <span class="spinner-border spinner-border-sm me-1"></span> }
              <i class="bi bi-search me-1"></i> Buscar
            </button>
          </div>
        </div>
      </div>
    </div>

    @if (loading()) {
      <app-loading-spinner message="Buscando entidad..."></app-loading-spinner>
    } @else if (entidad()) {
      <div class="card border-0 shadow-sm">
        <div class="card-body p-0">
          <table class="table table-hover mb-0">
            <thead class="bg-light">
              <tr>
                <th>NIT</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Activo</th>
                <th class="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{{ entidad()!.entidad_nit }}</td>
                <td>{{ entidad()!.nombre }}</td>
                <td>{{ entidad()!.email }}</td>
                <td>
                  @if (entidad()!.activo) {
                    <span class="badge bg-success">Activo</span>
                  } @else {
                    <span class="badge bg-secondary">Inactivo</span>
                  }
                </td>
                <td class="text-end">
                  <a [routerLink]="['/entidades', entidad()!.entidad_nit]" class="btn btn-sm btn-outline-primary">
                    <i class="bi bi-eye"></i>
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    } @else if (buscado()) {
      <app-empty-state icon="bi-search" title="Entidad no encontrada" message="No se encontró una entidad con ese NIT." />
    } @else {
      <app-empty-state icon="bi-building" title="Buscar entidad" message="Ingrese el NIT de una entidad fiscalizadora para ver su información." />
    }
  `,
})
export class EntidadesListarComponent {
  private service = inject(EntidadFiscalizadoraService);

  nitBusqueda = '';
  entidad = signal<EntidadFiscalizadora | null>(null);
  loading = signal(false);
  buscado = signal(false);

  buscar(): void {
    const nit = this.nitBusqueda.trim();
    if (!nit) return;
    this.loading.set(true);
    this.buscado.set(true);
    this.entidad.set(null);
    this.service.obtener(nit).subscribe({
      next: (data) => { this.entidad.set(data); this.loading.set(false); },
      error: () => { this.entidad.set(null); this.loading.set(false); },
    });
  }
}
