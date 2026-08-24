import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';
import { NavbarComponent } from './navbar/navbar.component';
import { LoadingService } from '../../core/services/loading.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, NavbarComponent],
  template: `
    <div class="d-flex" style="height: 100vh;">
      <app-sidebar [collapsed]="sidebarCollapsed()" (toggleCollapse)="sidebarCollapsed.set(!sidebarCollapsed())" />

      <div class="flex-grow-1 d-flex flex-column overflow-hidden">
        <app-navbar [notificationCount]="0" (toggleSidebar)="sidebarCollapsed.set(!sidebarCollapsed())" />

        <main class="flex-grow-1 overflow-auto p-4 bg-light position-relative">
          @if (loadingService.isLoading()) {
            <div class="position-absolute top-0 start-0 w-100 h-100 bg-white bg-opacity-75 d-flex align-items-center justify-content-center" style="z-index: 1000;">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
              </div>
            </div>
          }
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class LayoutComponent {
  sidebarCollapsed = signal(false);

  constructor(public loadingService: LoadingService) {}
}
