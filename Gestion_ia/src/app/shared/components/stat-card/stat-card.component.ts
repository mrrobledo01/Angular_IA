import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card border-0 shadow-sm h-100">
      <div class="card-body d-flex justify-content-between align-items-center">
        <div>
          <p class="text-muted small mb-1">{{ label() }}</p>
          <h3 class="fw-bold mb-0">{{ value() }}</h3>
          @if (trend() !== undefined) {
            <small [class]="trend()! > 0 ? 'text-success' : 'text-warning'">
              <i class="bi" [ngClass]="trend()! > 0 ? 'bi-arrow-up' : 'bi-arrow-down'"></i>
              {{ trend()! > 0 ? '+' : '' }}{{ trend() }}%
            </small>
          }
          @if (subtitle()) {
            <p class="text-muted small mb-0 mt-1">{{ subtitle() }}</p>
          }
        </div>
        @if (icon()) {
          <div class="rounded-circle d-flex align-items-center justify-content-center" [style.background]="iconBackground()" style="width: 48px; height: 48px;">
            <i class="bi text-white fs-5" [ngClass]="icon()"></i>
          </div>
        }
      </div>
    </div>
  `,
})
export class StatCardComponent {
  label = input.required<string>();
  value = input.required<string | number>();
  icon = input<string>();
  iconBackground = input('#0d6efd');
  trend = input<number>();
  subtitle = input<string>();
}
