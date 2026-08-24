import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="badge" [ngClass]="badgeClass()">{{ label() }}</span>
  `,
  styles: [`
    .badge { font-weight: 500; }
  `],
})
export class StatusBadgeComponent {
  status = input.required<string>();

  label(): string {
    return this.status().replace(/_/g, ' ');
  }

  badgeClass(): string {
    const map: Record<string, string> = {
      'DETECTADO': 'bg-info',
      'EN_REVISION': 'bg-warning text-dark',
      'CONFIRMADO': 'bg-success',
      'DESCARTADO': 'bg-secondary',
      'EXACTO': 'bg-success',
      'INEXACTO': 'bg-danger',
      'OMISO': 'bg-secondary',
      'PENDIENTE': 'bg-primary',
      'EN_PROCESO': 'bg-warning text-dark',
      'COMPLETADO': 'bg-success',
      'CANCELADO': 'bg-secondary',
      'ERROR': 'bg-danger',
    };
    return map[this.status()] || 'bg-secondary';
  }
}
