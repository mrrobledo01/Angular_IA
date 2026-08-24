import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="d-flex flex-column align-items-center justify-content-center py-5" [class.position-absolute]="overlay()" [class.w-100]="overlay()" [class.h-100]="overlay()" [class.bg-white]="overlay()" [class.bg-opacity-75]="overlay()" [style.z-index]="overlay() ? 100 : 'auto'">
      <div class="spinner-border text-primary" [style.width]="diameter() + 'px'" [style.height]="diameter() + 'px'" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
      @if (message()) {
        <p class="text-muted mt-3 mb-0">{{ message() }}</p>
      }
    </div>
  `,
})
export class LoadingSpinnerComponent {
  diameter = input(48);
  message = input<string>();
  overlay = input(false);
}
