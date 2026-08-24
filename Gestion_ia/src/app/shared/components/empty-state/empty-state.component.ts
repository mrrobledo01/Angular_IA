import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="text-center py-5">
      <i class="bi display-1 text-muted" [ngClass]="icon()"></i>
      <h5 class="mt-3 text-dark">{{ title() }}</h5>
      @if (message()) {
        <p class="text-muted">{{ message() }}</p>
      }
      <ng-content></ng-content>
    </div>
  `,
})
export class EmptyStateComponent {
  icon = input('bi-inbox');
  title = input('Sin datos');
  message = input<string>();
}
