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

  /**
   * Obtiene todas las pólizas vinculadas a un cliente por su GUID,
   * incluyendo la lista de asegurados de cada póliza.
   */
  getPoliciesByClient(clientGuid: string): Observable<Policy[]> {
    return this.http.get<Policy[]>(`${this.apiUrl}/client/${clientGuid}`);
  }

  /**
   * Obtiene el detalle de una póliza por su GUID.
   */
  getPolicyByGuid(guid: string): Observable<Policy> {
    return this.http.get<Policy>(`${this.apiUrl}/${guid}`);
  }

  /**
   * Crea una o múltiples pólizas asociadas a un cliente.
   * El objeto de cada póliza incluye el arreglo `insureds: [...]`
   */
  createMultiplePolicies(clientGuid: string, policies: any[]): Observable<void> {
    const payload: CreateClientPoliciesRequest = {
      clientGuid,
      policies
    };
    return this.http.post<void>(`${this.apiUrl}/bulk`, payload);
  }

  /**
   * Actualiza los datos de una póliza y sincroniza su lista de asegurados.
   */
  updatePolicy(guid: string, policyData: any): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${guid}`, policyData);
  }

  /**
   * Elimina una póliza por su GUID.
   */
  deletePolicy(guid: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${guid}`);
  }
}