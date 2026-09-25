import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { Client } from '../../models/client.model';
import { PolicyService } from '../../services/policy.service';

@Component({
  selector: 'app-policy-modal',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule ],
  templateUrl: './policy-modal.component.html',
  styleUrls: ['./policy-modal.component.css']
})
export class PolicyModalComponent implements OnChanges {
  @Input() client: Client | null = null;
  @Input() showPrompt: boolean = false; // Muestra el mini modal: "¿Desea agregar pólizas?"
  @Input() showForm: boolean = false;   // NUEVO: Permite abrir el formulario directamente

  @Output() completed = new EventEmitter<void>(); // Evento cuando se guardan las pólizas o se cierra
  @Output() cancelled = new EventEmitter<void>(); // Evento si el usuario responde "No"

  policyForm!: FormGroup;
  showPolicySection: boolean = false; // Despliega el formulario de pólizas

  constructor(
    private fb: FormBuilder,
    private policyService: PolicyService
  ) {
    this.initPolicyForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Si cambia el cliente o se activa el prompt, reseteamos el formulario
    if (changes['client'] && this.client) {
      this.resetForms();
    }

    // NUEVO: Si 'showForm' cambia a true, abre el formulario directamente
    if (changes['showForm']) {
      if (this.showForm) {
        this.showPolicySection = true;
        this.policies.clear();
        this.addPolicyField();
      } else {
        this.resetForms();
      }
    }
  }

  initPolicyForm(): void {
    this.policyForm = this.fb.group({
      policies: this.fb.array([])
    });
  }

  get policies(): FormArray {
    return this.policyForm.get('policies') as FormArray;
  }

  // Pre-llena nombre, apellido y fecha de nacimiento con los datos del cliente
  newPolicyGroup(): FormGroup {
    let formattedBirthDate = '';
    if (this.client?.birthDate) {
      formattedBirthDate = new Date(this.client.birthDate).toISOString().split('T')[0];
    }

    return this.fb.group({
      insuredFirstName: [this.client?.firstName || '', Validators.required],
      insuredLastName: [this.client?.lastName || '', Validators.required],
      insuredBirthDate: [formattedBirthDate],
      policyType: ['', Validators.required], // Vacío por defecto
      policyNumber: ['', Validators.required],
      company: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      paymentFrequency: ['', Validators.required], // Vacío por defecto
      netPremium: ['', [Validators.required, Validators.min(0)]], // Vacío por defecto
      totalPremium: ['', [Validators.required, Validators.min(0)]], // Vacío por defecto
      commissionPercentage: ['', [Validators.required, Validators.min(0), Validators.max(100)]] // Vacío por defecto
    });
  }

  addPolicyField(): void {
    // Si ya existen elementos en el array y la estructura es inválida, no permite agregar otra
    if (this.policies.length > 0 && this.policies.invalid) {
      this.policies.markAllAsTouched();
      return;
    }

    this.policies.push(this.newPolicyGroup());
  }

  removePolicyField(index: number): void {
    this.policies.removeAt(index);
  }

  // Respuesta al mini modal de pregunta
  onPromptResponse(wantToAddPolicies: boolean): void {
    this.showPrompt = false;

    if (wantToAddPolicies) {
      this.showPolicySection = true;
      this.policies.clear();
      this.addPolicyField(); // Agrega la primera póliza pre-llenada
    } else {
      this.resetForms();
      this.cancelled.emit();
    }
  }

  // Guardar pólizas en el backend
  onSubmitPolicies(): void {
    if (this.policyForm.invalid || !this.client?.guid) {
      this.policyForm.markAllAsTouched();
      return;
    }

    const rawPolicies = this.policies.value;

    // Pasamos el GUID del cliente y el listado de pólizas
    this.policyService.createMultiplePolicies(this.client.guid, rawPolicies).subscribe({
      next: () => {
        this.resetForms();
        this.completed.emit();
      },
      error: (err) => console.error('Error guardando pólizas:', err)
    });
  }

  closeModal(): void {
    this.resetForms();
    this.cancelled.emit();
  }

  private resetForms(): void {
    this.showPolicySection = false;
    this.policies.clear();
  }
}