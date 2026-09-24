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

  // Guardar múltiples pólizas vinculadas a un cliente por su GUID
  createMultiplePolicies(clientGuid: string, policies: Policy[]): Observable<any> {
    const payload: CreateClientPoliciesRequest = {
      clientGuid: clientGuid,
      policies: policies
    };
    return this.http.post<any>(`${this.apiUrl}/bulk`, payload);
  }

  // Obtener todas las pólizas
  getAllPolicies(): Observable<Policy[]> {
    return this.http.get<Policy[]>(this.apiUrl);
  }

  // Obtener póliza por GUID
  getPolicyByGuid(guid: string): Observable<Policy> {
    return this.http.get<Policy>(`${this.apiUrl}/${guid}`);
  }

  // Obtener todas las pólizas asociadas a un cliente específico por su GUID
  getPoliciesByClientGuid(clientGuid: string): Observable<Policy[]> {
    return this.http.get<Policy[]>(`${this.apiUrl}/client/${clientGuid}`);
  }

  // Actualizar póliza existente por su GUID
  updatePolicy(guid: string, policy: Policy): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${guid}`, policy);
  }

  // Eliminar póliza por su GUID
  deletePolicy(guid: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${guid}`);
  }
}