import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClientService } from '../../services/client.service';
import { Client } from '../../models/client.model';
import { PolicyModalComponent } from '../policy-modal/policy-modal.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PolicyModalComponent, RouterLink],
  templateUrl: './clients.component.html',
  styleUrl: './clients.component.css'
})
export class ClientsComponent implements OnInit {
  clients: Client[] = [];
  filteredClients: Client[] = [];
  clientForm: FormGroup;
  
  searchTerm: string = '';
  isModalOpen: boolean = false;
  isDeleteModalOpen: boolean = false;
  isEditMode: boolean = false;
  
  selectedClientId: number | null = null;
  isLoading: boolean = false;

  selectedClientForPolicy: Client | null = null;
  showPolicyPrompt: boolean = false;

  constructor(
    private clientService: ClientService,
    private fb: FormBuilder
  ) {
    this.clientForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      identificationNumber: [''],
      birthDate: [''],
      city: [''],
      clientType: [1, [Validators.required]], // 1 = Cliente por defecto
      isActive: [true]
    });
  }

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
    this.isEditMode = false;
    this.selectedClientId = null;
    this.clientForm.reset({ isActive: true });
    this.isModalOpen = true;
  }

  openEditModal(client: Client): void {
    this.isEditMode = true;
    this.selectedClientId = client.id || null;

    // Formatear la fecha a YYYY-MM-DD para el <input type="date">
    let formattedBirthDate = '';
    if (client.birthDate) {
      formattedBirthDate = new Date(client.birthDate).toISOString().split('T')[0];
    }

    this.clientForm.patchValue({
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email,
      phone: client.phone,
      identificationNumber: client.identificationNumber || '',
      birthDate: formattedBirthDate,
      city: client.city,
      clientType: client.clientType ?? 1,
      isActive: client.isActive
    });
    this.isModalOpen = true;
  }

  // Método para cambiar el Switch de Tipo de Registro (1 <-> 2)
  setClientType(type: number): void {
    this.clientForm.patchValue({ clientType: type });
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.clientForm.reset({ clientType: 1, isActive: true });
    this.isEditMode = false;
  }

  saveClient(): void {
    if (this.clientForm.invalid) {
      this.clientForm.markAllAsTouched();
      return;
    }

    const clientData: Client = this.clientForm.value;

    if (this.isEditMode && this.selectedClientId) {
      this.clientService.updateClient(this.selectedClientId, clientData).subscribe({
        next: () => {
          this.loadClients();
          this.closeModal();
        },
        error: (err) => console.error('Error al actualizar cliente', err)
      });
    } else {
      this.clientService.createClient(clientData).subscribe({
        next: (createdClient: Client) => {
          this.loadClients();
          this.closeModal();

          // 🔹 SI ES CLIENTE (valor 1), ACTIVAR EL MODAL DE PÓLIZA
          if (createdClient && createdClient.clientType === 1) {
            this.selectedClientForPolicy = createdClient;
            this.showPolicyPrompt = true;
          }
        },
        error: (err) => console.error('Error al crear cliente', err)
      });
    }
  }

  confirmDelete(id: number): void {
    this.selectedClientId = id;
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen = false;
    this.selectedClientId = null;
  }

  executeDelete(): void {
    if (this.selectedClientId) {
      this.clientService.deleteClient(this.selectedClientId).subscribe({
        next: () => {
          this.loadClients();
          this.closeDeleteModal();
        },
        error: (err) => console.error('Error al eliminar cliente', err)
      });
    }
  }

  // 🔹 MÉTODO PARA CERRAR Y LIMPIAR EL MODAL DE PÓLIZAS
  onPolicyModalFinished(): void {
    this.showPolicyPrompt = false;
    this.selectedClientForPolicy = null;
    this.loadClients(); // Recarga la tabla para reflejar cambios si aplica
  }
}