import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      switch (error.status) {
        case 401:
          notificationService.error('No autorizado', 'Su sesión ha expirado');
          break;
        case 403:
          notificationService.error('Prohibido', 'No tiene permisos');
          break;
        case 500:
          notificationService.error('Error del servidor', error.error?.detail || error.message);
          break;
      }
      return throwError(() => error);
    })
  );
};
