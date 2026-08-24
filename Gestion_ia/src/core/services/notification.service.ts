import { Injectable, signal } from '@angular/core';

export interface Notificacion {
  id: number;
  tipo: 'success' | 'error' | 'warning' | 'info';
  titulo: string;
  mensaje: string;
  timestamp: Date;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  readonly notificaciones = signal<Notificacion[]>([]);

  private nextId = 0;

  success(titulo: string, mensaje: string): void {
    this.agregar('success', titulo, mensaje);
  }

  error(titulo: string, mensaje: string): void {
    this.agregar('error', titulo, mensaje);
  }

  warning(titulo: string, mensaje: string): void {
    this.agregar('warning', titulo, mensaje);
  }

  info(titulo: string, mensaje: string): void {
    this.agregar('info', titulo, mensaje);
  }

  private agregar(tipo: Notificacion['tipo'], titulo: string, mensaje: string): void {
    const notificacion: Notificacion = {
      id: this.nextId++,
      tipo,
      titulo,
      mensaje,
      timestamp: new Date(),
    };

    this.notificaciones.update((notifs) => [...notifs, notificacion]);

    setTimeout(() => this.dismiss(notificacion.id), 5000);
  }

  dismiss(id: number): void {
    this.notificaciones.update((notifs) => notifs.filter((n) => n.id !== id));
  }
}
