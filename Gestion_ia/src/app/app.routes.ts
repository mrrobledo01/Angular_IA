import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'entidades',
        children: [
          { path: '', loadComponent: () => import('./features/entidades/entidades-listar.component').then((m) => m.EntidadesListarComponent) },
          { path: 'crear', loadComponent: () => import('./features/entidades/entidad-crear.component').then((m) => m.EntidadCrearComponent) },
          { path: ':nit', loadComponent: () => import('./features/entidades/entidad-detalle.component').then((m) => m.EntidadDetalleComponent) },
        ],
      },
      {
        path: 'procesos',
        children: [
          { path: '', loadComponent: () => import('./features/procesos/procesos-listar.component').then((m) => m.ProcesosListarComponent) },
          { path: 'crear', loadComponent: () => import('./features/procesos/proceso-crear.component').then((m) => m.ProcesoCrearComponent) },
          { path: ':id', loadComponent: () => import('./features/procesos/proceso-detalle.component').then((m) => m.ProcesoDetalleComponent) },
        ],
      },
      {
        path: 'analisis',
        loadComponent: () => import('./features/analisis/analisis-individual.component').then((m) => m.AnalisisIndividualComponent),
      },
      {
        path: 'comportamiento',
        loadComponent: () => import('./features/analisis/analisis-comportamental.component').then((m) => m.AnalisisComportamentalComponent),
      },
      {
        path: 'reglas',
        loadComponent: () => import('./features/reglas/reglas-fiscalizacion.component').then((m) => m.ReglasFiscalizacionComponent),
      },
    ],
  },
];
