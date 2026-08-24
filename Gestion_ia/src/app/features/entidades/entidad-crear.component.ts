import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { EntidadFiscalizadoraService } from '../../../core/services/entidad-fiscalizadora.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-entidad-crear',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, PageHeaderComponent],
  template: `
    <app-page-header title="Crear Entidad Fiscalizadora" backRoute="/entidades" [breadcrumb]="[{ label: 'Fiscalización', route: '/entidades' }, { label: 'Crear Entidad' }]" />

    <div class="card border-0 shadow-sm" style="max-width: 600px;">
      <div class="card-body p-4">
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="mb-3">
            <label class="form-label">NIT</label>
            <input type="text" class="form-control" formControlName="entidad_nit" placeholder="Ej: 900123456" />
            @if (form.get('entidad_nit')?.touched && form.get('entidad_nit')?.hasError('required')) {
              <div class="text-danger small">El NIT es obligatorio</div>
            }
          </div>

          <div class="mb-3">
            <label class="form-label">Nombre</label>
            <input type="text" class="form-control" formControlName="nombre" />
            @if (form.get('nombre')?.touched && form.get('nombre')?.hasError('required')) {
              <div class="text-danger small">El nombre es obligatorio</div>
            }
          </div>

          <div class="mb-4">
            <label class="form-label">Email</label>
            <input type="email" class="form-control" formControlName="email" />
            @if (form.get('email')?.touched && form.get('email')?.hasError('required')) {
              <div class="text-danger small">El email es obligatorio</div>
            }
            @if (form.get('email')?.touched && form.get('email')?.hasError('email')) {
              <div class="text-danger small">Ingrese un email válido</div>
            }
          </div>

          <div class="d-flex justify-content-end gap-2">
            <a routerLink="/entidades" class="btn btn-outline-secondary">Cancelar</a>
            <button type="submit" class="btn btn-primary" [disabled]="form.invalid || saving()">
              @if (saving()) {
                <span class="spinner-border spinner-border-sm me-1"></span>
              }
              Crear Entidad
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class EntidadCrearComponent {
  private fb = inject(FormBuilder);
  private service = inject(EntidadFiscalizadoraService);
  private notification = inject(NotificationService);
  private router = inject(Router);

  saving = signal(false);

  form: FormGroup = this.fb.group({
    entidad_nit: ['', Validators.required],
    nombre: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
  });

  onSubmit(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.service.crear(this.form.value).subscribe({
      next: () => { this.notification.success('Entidad creada', 'La entidad fue creada exitosamente'); this.router.navigate(['/entidades']); },
      error: () => this.saving.set(false),
    });
  }
}
