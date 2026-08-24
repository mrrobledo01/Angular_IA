import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="navbar navbar-expand-lg navbar-light bg-white border-bottom px-4">
      <button class="btn btn-link" (click)="toggleSidebar.emit()">
        <i class="bi bi-list fs-4"></i>
      </button>

      <div class="ms-3 flex-grow-1">
        <div class="input-group" style="max-width: 300px;">
          <span class="input-group-text bg-light border-0">
            <i class="bi bi-search"></i>
          </span>
          <input type="text" class="form-control bg-light border-0" placeholder="Buscar... (Ctrl+K)" />
        </div>
      </div>

      <div class="d-flex align-items-center gap-3">
        <button class="btn btn-link position-relative">
          <i class="bi bi-bell fs-5"></i>
          @if (notificationCount() > 0) {
            <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
              {{ notificationCount() }}
            </span>
          }
        </button>

        <div class="dropdown">
          <button class="btn btn-link dropdown-toggle d-flex align-items-center" data-bs-toggle="dropdown">
            <div class="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center" style="width: 32px; height: 32px;">
              <i class="bi bi-person"></i>
            </div>
            <span class="ms-2">Admin</span>
          </button>
          <ul class="dropdown-menu dropdown-menu-end">
            <li><a class="dropdown-item" href="#"><i class="bi bi-person me-2"></i>Mi perfil</a></li>
            <li><a class="dropdown-item" href="#"><i class="bi bi-gear me-2"></i>Configuración</a></li>
            <li><hr class="dropdown-divider" /></li>
            <li><a class="dropdown-item" href="#"><i class="bi bi-box-arrow-right me-2"></i>Cerrar sesión</a></li>
          </ul>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .nav-link {
      text-decoration: none;
    }
  `],
})
export class NavbarComponent {
  notificationCount = input(0);
  toggleSidebar = output();
}
