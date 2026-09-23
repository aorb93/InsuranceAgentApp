import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si recibimos un 401 y no proviene de la propia ruta de login o refresh
      if (
        error.status === 401 && 
        !req.url.includes('/login') && 
        !req.url.includes('/refresh-token')
      ) {
        return authService.refreshToken().pipe(
          switchMap((response) => {
            // Reintentar la petición HTTP original con el nuevo token de acceso
            const newReq = req.clone({
              setHeaders: { Authorization: `Bearer ${response.accessToken}` }
            });
            return next(newReq);
          }),
          catchError((refreshError) => {
            // Si el Refresh Token también venció o es inválido, cerrar sesión
            authService.logout();
            router.navigate(['/login']);
            return throwError(() => refreshError);
          })
        );
      }

      return throwError(() => error);
    })
  );
};