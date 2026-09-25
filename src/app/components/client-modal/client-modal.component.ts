import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Client } from '../../models/client.model';
import { ClientService } from '../../services/client.service';
import { PolicyModalComponent } from '../policy-modal/policy-modal.component';

@Component({
  selector: 'app-client-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PolicyModalComponent],
  templateUrl: './client-modal.component.html',
  styleUrls: ['./client-modal.component.css']
})
export class ClientModalComponent implements OnChanges {
  @Input() client: Client | null = null;
  @Input() show: boolean = false;
  @Output() completed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  clientForm: FormGroup;
  createdClient: Client | null = null;

  // Banderas de control de vistas internas
  showClientForm: boolean = true;
  showPolicyPrompt: boolean = false;

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService
  ) {
    this.clientForm = this.fb.group({
      guid: [''],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      identificationNumber: [''],
      birthDate: [''],
      city: [''],
      clientType: [1, [Validators.required]],
      isActive: [true]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['client'] || changes['show']) && this.show && this.client) {
      let formattedBirthDate = '';
      if (this.client.birthDate) {
        formattedBirthDate = new Date(this.client.birthDate).toISOString().split('T')[0];
      }

      this.clientForm.patchValue({
        guid: this.client.guid || '',
        firstName: this.client.firstName,
        lastName: this.client.lastName,
        email: this.client.email,
        phone: this.client.phone,
        identificationNumber: this.client.identificationNumber || '',
        birthDate: formattedBirthDate,
        city: this.client.city || '',
        clientType: this.client.clientType || 1,
        isActive: this.client.isActive ?? true
      });
    }
  }

  setClientType(type: number): void {
    this.clientForm.patchValue({ clientType: type });
  }

  close(): void {
    this.cancelled.emit();
  }

  saveClient(): void {
    if (this.clientForm.invalid) {
      this.clientForm.markAllAsTouched();
      return;
    }

    const clientData: Client = this.clientForm.value;
    const clientGuid = clientData.guid;

    if (clientGuid) {
      this.clientService.updateClient(clientGuid, clientData).subscribe({
        next: () => this.completed.emit(),
        error: (err) => console.error('Error al actualizar el cliente:', err)
      });
    } else {
      this.clientService.createClient(clientData).subscribe({
        next: (res: any) => {
          this.createdClient = res?.data ? res.data : res;

          // Evalúa el tipo de cliente enviado o retornado por la API
          const isClientType = (this.createdClient?.clientType ?? clientData.clientType) === 1;

          if (isClientType) {
            // Si es tipo Cliente (1), muestra el prompt de pólizas
            this.showClientForm = false;
            this.showPolicyPrompt = true;
          } else {
            // Si es Prospecto (2), finaliza el flujo y cierra el modal
            this.completed.emit();
          }
        },
        error: (err) => console.error('Error al crear el cliente:', err)
      });
    }
  }

  onPolicyModalFinished(): void {
    this.resetModalState();
    this.completed.emit();
  }

  private resetModalState(): void {
    this.showClientForm = true;
    this.showPolicyPrompt = false;
    this.createdClient = null;
    this.clientForm.reset({ clientType: 1, isActive: true });
  }
}