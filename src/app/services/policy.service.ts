import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Policy } from '../models/policy.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PolicyService {
  private apiUrl = `${environment.apiUrl}/policies`;

  constructor(private http: HttpClient) {}

  createPolicy(policy: Policy): Observable<Policy> {
    return this.http.post<Policy>(this.apiUrl, policy);
  }

  // Opcional: Para guardar múltiples pólizas en una sola llamada
  createMultiplePolicies(policies: Policy[]): Observable<Policy[]> {
    return this.http.post<Policy[]>(`${this.apiUrl}/bulk`, policies);
  }
}