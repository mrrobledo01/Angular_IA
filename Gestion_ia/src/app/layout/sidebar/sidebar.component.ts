import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="sidebar" [class.collapsed]="collapsed()">
      <div class="sidebar-header">
        <i class="bi bi-grid-3x3-gap-fill fs-4 text-primary"></i>
        @if (!collapsed()) {
          <span class="fw-bold ms-2">Fiscalizacion IA</span>
        }
      </div>

      <ul class="nav flex-column">
        <li class="nav-item" *ngFor="let item of menuItems">
          <a class="nav-link" [routerLink]="item.route" routerLinkActive="active" [routerLinkActiveOptions]="{exact: item.route === '/'}">
            <i class="bi" [ngClass]="item.icon"></i>
            @if (!collapsed()) {
              <span class="ms-2">{{ item.label }}</span>
            }
          </a>
        </li>
      </ul>
    </nav>
  `,
  styles: [`
    .sidebar {
      width: 260px;
      height: 100vh;
      background: white;
      border-right: 1px solid #dee2e6;
      display: flex;
      flex-direction: column;
      transition: width 0.3s ease;
      overflow: hidden;
    }

    .sidebar.collapsed {
      width: 72px;
    }

    .sidebar-header {
      display: flex;
      align-items: center;
      padding: 1rem;
      border-bottom: 1px solid #dee2e6;
    }

    .nav-link {
      display: flex;
      align-items: center;
      padding: 0.75rem 1rem;
      color: #495057;
      text-decoration: none;
      border-left: 3px solid transparent;
      transition: all 0.2s;
    }

    .nav-link:hover {
      background-color: #f8f9fa;
      color: #0d6efd;
    }

    .nav-link.active {
      background-color: #e7f1ff;
      color: #0d6efd;
      border-left-color: #0d6efd;
    }

    .nav-link i {
      font-size: 1.25rem;
    }
  `],
})
export class SidebarComponent {
  collapsed = input(false);
  toggleCollapse = output();

  menuItems = [
    { icon: 'bi-speedometer2', label: 'Dashboard', route: '/dashboard' },
    { icon: 'bi-building', label: 'Entidades', route: '/entidades' },
    { icon: 'bi-file-earmark-text', label: 'Procesos', route: '/procesos' },
    { icon: 'bi-graph-up', label: 'Análisis Individual', route: '/analisis' },
    { icon: 'bi-people', label: 'Análisis Comportamental', route: '/comportamiento' },
    { icon: 'bi-shield-check', label: 'Reglas y Hallazgos', route: '/reglas' },
  ];
}
