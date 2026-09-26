import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientService } from '../../services/client.service';
import { Client } from '../../models/client.model';
//import { PolicyModalComponent } from '../policy-modal/policy-modal.component';
import { ClientModalComponent } from '../client-modal/client-modal.component';
import { RouterLink } from '@angular/router';
import { PhoneFormatPipe } from '../../pipes/phone-format.pipe';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [
    CommonModule, 
    //PolicyModalComponent, 
    ClientModalComponent, 
    RouterLink,
    PhoneFormatPipe
  ],
  templateUrl: './clients.component.html',
  styleUrl: './clients.component.css'
})
export class ClientsComponent implements OnInit {
  clients: Client[] = [];
  filteredClients: Client[] = [];
  
  searchTerm: string = '';
  isModalOpen: boolean = false;
  isDeleteModalOpen: boolean = false;
  
  selectedClient: Client | null = null;
  selectedClientGuid: string | null = null;
  isLoading: boolean = false;

  //selectedClientForPolicy: Client | null = null;
  //showPolicyPrompt: boolean = false;

  constructor(private clientService: ClientService) {}

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.isLoading = true;
    this.clientService.getClients().subscribe({
      next: (data) => {
        this.clients = data;
        this.applyFilter();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar clientes', err);
        this.isLoading = false;
      }
    });
  }

  onSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.applyFilter();
  }

  applyFilter(): void {
    if (!this.searchTerm.trim()) {
      this.filteredClients = [...this.clients];
      return;
    }

    this.filteredClients = this.clients.filter(c => 
      c.firstName.toLowerCase().includes(this.searchTerm) ||
      c.lastName.toLowerCase().includes(this.searchTerm) ||
      c.email.toLowerCase().includes(this.searchTerm) ||
      c.phone.includes(this.searchTerm) ||
      (c.identificationNumber && c.identificationNumber.toLowerCase().includes(this.searchTerm))
    );
  }

  openCreateModal(): void {
    this.selectedClient = null;
    this.isModalOpen = true;
  }

  openEditModal(client: Client): void {
    this.selectedClient = client;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedClient = null;
  }

  onClientSaved(): void {
    this.closeModal();
    this.loadClients();
  }

  confirmDelete(guid: string): void {
    this.selectedClientGuid = guid;
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen = false;
    this.selectedClientGuid = null;
  }

  executeDelete(): void {
    if (this.selectedClientGuid) {
      this.clientService.deleteClient(this.selectedClientGuid).subscribe({
        next: () => {
          this.loadClients();
          this.closeDeleteModal();
        },
        error: (err) => console.error('Error al eliminar cliente', err)
      });
    }
  }

  getPolicyBadgeClass(typeName: string): string {
    if (!typeName) return 'badge-policy-default';
    const name = typeName.toLowerCase();

    if (name.includes('vida')) return 'badge-policy-vida';
    if (name.includes('auto') || name.includes('vehic')) return 'badge-policy-auto';
    if (name.includes('daño') || name.includes('hogar') || name.includes('incendio')) return 'badge-policy-danos';
    if (name.includes('médic') || name.includes('salud') || name.includes('gmm')) return 'badge-policy-salud';
    if (name.includes('ahorro') || name.includes('retiro')) return 'badge-policy-ahorro';

    return 'badge-policy-default';
  }
}