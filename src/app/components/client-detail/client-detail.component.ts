import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClientService } from '../../services/client.service';
import { PolicyService } from '../../services/policy.service';
import { Client } from '../../models/client.model';
import { Policy } from '../../models/policy.model';
import { PolicyDetailComponent } from '../policy-detail/policy-detail.component';
import { PolicyModalComponent } from '../policy-modal/policy-modal.component';
import { ClientModalComponent } from '../client-modal/client-modal.component';
import { PhoneFormatPipe } from '../../pipes/phone-format.pipe';

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, PolicyDetailComponent, PolicyModalComponent, ClientModalComponent, PhoneFormatPipe],
  templateUrl: './client-detail.component.html',
  styleUrls: ['./client-detail.component.css']
})
export class ClientDetailComponent implements OnInit {
  clientGuid!: string;
  client?: Client;
  policies: Policy[] = [];
  loading: boolean = true;

  /** Póliza seleccionada para ver / editar */
  selectedPolicy: Policy | null = null;
  showPolicyDetail: boolean = false;

  /** Control para abrir el modal de nueva póliza */
  showAddPolicyModal: boolean = false;

  /** Control y Formulario para Editar Cliente */
  isEditModalOpen: boolean = false;
  clientForm!: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clientService: ClientService,
    private policyService: PolicyService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initClientForm();
    this.clientGuid = this.route.snapshot.paramMap.get('guid') || '';
    if (this.clientGuid) {
      this.loadClientData();
    }
  }

  /** Inicializa la estructura del formulario de cliente */
  initClientForm(): void {
    this.clientForm = this.fb.group({
      guid: [''],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      identificationNumber: [''],
      birthDate: [''],
      city: [''],
      clientType: [1, Validators.required],
      isActive: [true]
    });
  }

  loadClientData(): void {
    this.loading = true;

    // Obtener datos del cliente
    this.clientService.getClientByGuid(this.clientGuid).subscribe({
      next: (data) => {
        this.client = data;
        this.loadPolicies();
      },
      error: (err) => console.error('Error cargando cliente:', err)
    });
  }

  loadPolicies(): void {
    // Obtener pólizas asociadas al cliente
    this.policyService.getPoliciesByClientGuid(this.clientGuid).subscribe({
      next: (policies) => {
        this.policies = policies;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando pólizas:', err);
        this.loading = false;
      }
    });
  }

  /** Abre el modal para registrar nuevas pólizas */
  openAddPolicyModal(): void { 
    this.showAddPolicyModal = true;
  }

  /** Evento cuando se guardan correctamente las pólizas */
  onAddPolicyCompleted(): void { 
    this.showAddPolicyModal = false;
    this.loadPolicies(); // Recarga las pólizas para mostrar las recién agregadas
  }

  /** Evento cuando se cancela o cierra el modal de registro */
  onAddPolicyCancelled(): void { 
    this.showAddPolicyModal = false;
  }

  /** Cambia el tipo de registro en el formulario */
  setClientType(type: number): void {
    this.clientForm.patchValue({ clientType: type });
  }

  /** Guarda los cambios editados del cliente */
  saveClient(): void {
    if (this.clientForm.invalid) {
      this.clientForm.markAllAsTouched();
      return;
    }

    const updatedData = this.clientForm.value;

    this.clientService.updateClient(this.clientGuid, updatedData).subscribe({
      next: () => {
        this.closeEditModal();
        this.loadClientData(); // Recarga los datos actualizados en pantalla
      },
      error: (err) => console.error('Error al actualizar el cliente:', err)
    });
  }

  /** Abre el modal de detalle con la póliza seleccionada */
  openPolicyDetail(policy: Policy): void {
    this.selectedPolicy = policy;
    this.showPolicyDetail = true;
  }

  /** Cierra el modal de detalle y limpia la selección */
  closePolicyDetail(): void {
    this.showPolicyDetail = false;
    this.selectedPolicy = null;
  }

  /** Se llama cuando PolicyDetailComponent emite que guardó cambios */
  onPolicyUpdated(): void {
    this.closePolicyDetail();
    this.loadPolicies(); // Recarga la lista para reflejar los nuevos datos
  }

  goBack(): void {
    this.router.navigate(['/clients']);
  }

  openEditModal(): void {
    this.isEditModalOpen = true;
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
  }

  onClientUpdated(): void {
    this.closeEditModal();
    this.loadClientData();
  }
}
