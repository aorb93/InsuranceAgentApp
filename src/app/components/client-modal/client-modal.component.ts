import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Client } from '../../models/client.model';
import { ClientService } from '../../services/client.service';

@Component({
  selector: 'app-client-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './client-modal.component.html',
  styleUrls: ['./client-modal.component.css']
})
export class ClientModalComponent implements OnChanges {
  @Input() client: Client | null = null;
  @Input() show: boolean = false;
  @Output() completed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  clientForm: FormGroup;

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
        next: () => this.completed.emit(),
        error: (err) => console.error('Error al crear el cliente:', err)
      });
    }
  }
}