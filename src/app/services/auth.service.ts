import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  agentGuid: string;
  fullName: string;
  email: string;
  licenseNumber: string;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Ajusta este puerto al HTTPS asignado a tu API en .NET
  private apiUrl = 'https://localhost:7125/api/auth';

  constructor(private http: HttpClient) {}

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        localStorage.setItem('agentData', JSON.stringify(response));
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('agentData');
  }
}