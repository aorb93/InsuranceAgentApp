import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Policy, CreateClientPoliciesRequest } from '../models/policy.model';
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
  createMultiplePolicies(clientId: number, policies: Policy[]): Observable<Policy[]> {
    const payload: CreateClientPoliciesRequest = {
      clientId: clientId,
      policies: policies
    };
    return this.http.post<Policy[]>(`${this.apiUrl}/bulk`, payload);
  }

  // Obtener todas las pólizas
  getAllPolicies(): Observable<Policy[]> {
    return this.http.get<Policy[]>(this.apiUrl);
  }

  // Obtener póliza por ID
  getPolicyById(id: number): Observable<Policy> {
    return this.http.get<Policy>(`${this.apiUrl}/${id}`);
  }

  // Obtener todas las pólizas asociadas a un cliente específico
  getPoliciesByClientId(clientId: number): Observable<Policy[]> {
    return this.http.get<Policy[]>(`${this.apiUrl}/client/${clientId}`);
  }

  // Actualizar póliza existente
  updatePolicy(id: number, policy: Policy): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, policy);
  }

  // Eliminar póliza
  deletePolicy(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  getPoliciesByClientGuid(clientGuid: string): Observable<Policy[]> {
   return this.http.get<Policy[]>(`${this.apiUrl}/client/guid/${clientGuid}`);
  }
}