import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Client } from '../models/client.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private apiUrl = `${environment.apiUrl || 'http://localhost:5000/api'}/clients`;

  constructor(private http: HttpClient) {}

  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(this.apiUrl);
  }

  getClientByGuid(guid: string): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/${guid}`);
  }

  createClient(client: Client): Observable<Client> {
    return this.http.post<Client>(this.apiUrl, client);
  }

  updateClient(guid: string, client: Client): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${guid}`, client);
  }

  deleteClient(guid: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${guid}`);
  }
}