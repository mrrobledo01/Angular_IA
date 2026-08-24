import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="d-flex justify-content-between align-items-start mb-4">
      <div>
        @if (backRoute()) {
          <a [routerLink]="backRoute()" class="text-decoration-none text-muted mb-2 d-inline-block">
            <i class="bi bi-arrow-left me-1"></i> Volver
          </a>
        }
        @if (breadcrumb().length > 0) {
          <nav aria-label="breadcrumb">
            <ol class="breadcrumb mb-1">
              @for (item of breadcrumb(); track item.label) {
                @if (item.route) {
                  <li class="breadcrumb-item"><a [routerLink]="item.route" class="text-decoration-none">{{ item.label }}</a></li>
                } @else {
                  <li class="breadcrumb-item active">{{ item.label }}</li>
                }
              }
            </ol>
          </nav>
        }
        <h4 class="fw-bold mb-0">{{ title() }}</h4>
      </div>
      <div class="d-flex gap-2">
        <ng-content></ng-content>
      </div>
    </div>
  `,
})
export class PageHeaderComponent {
  title = input.required<string>();
  backRoute = input<string>();
  breadcrumb = input<{ label: string; route?: string }[]>([]);
}
