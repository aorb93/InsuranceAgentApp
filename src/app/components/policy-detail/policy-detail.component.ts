import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Policy } from '../../models/policy.model';
import { PolicyService } from '../../services/policy.service';

@Component({
  selector: 'app-policy-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './policy-detail.component.html',
  styleUrls: ['./policy-detail.component.css']
})
export class PolicyDetailComponent implements OnChanges {
  /** Póliza a mostrar / editar */
  @Input() policy: Policy | null = null;
  /** Controla la visibilidad del modal */
  @Input() show: boolean = false;

  /** Se emite cuando el modal se cierra sin cambios */
  @Output() closed = new EventEmitter<void>();
  /** Se emite cuando la póliza fue actualizada exitosamente */
  @Output() updated = new EventEmitter<void>();

  /** false = modo detalle (solo lectura) | true = modo edición (formulario) */
  isEditMode: boolean = false;
  isSaving: boolean = false;

  editForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private policyService: PolicyService
  ) {
    this.buildForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Cada vez que cambia la póliza seleccionada, resetear a modo detalle
    if (changes['policy'] && this.policy) {
      this.isEditMode = false;
      this.isSaving = false;
    }
    // Si se cierra el modal desde el padre, asegurarse de limpiar estado
    if (changes['show'] && !this.show) {
      this.isEditMode = false;
      this.isSaving = false;
    }
  }

  // ─── Formulario ────────────────────────────────────────────────────────────

  private buildForm(): void {
    this.editForm = this.fb.group({
      insuredFirstName:     ['', [Validators.required, Validators.minLength(2)]],
      insuredLastName:      ['', [Validators.required, Validators.minLength(2)]],
      insuredBirthDate:     [''],
      policyType:           ['', Validators.required],
      policyNumber:         ['', Validators.required],
      company:              ['', Validators.required],
      startDate:            ['', Validators.required],
      endDate:              ['', Validators.required],
      paymentFrequency:     ['', Validators.required],
      netPremium:           [0, [Validators.required, Validators.min(0)]],
      totalPremium:         [0, [Validators.required, Validators.min(0)]],
      commissionPercentage: [0, [Validators.required, Validators.min(0), Validators.max(100)]]
    });
  }

  /** Precarga el formulario con los datos de la póliza actual */
  private patchForm(policy: Policy): void {
    this.editForm.patchValue({
      insuredFirstName:     policy.insuredFirstName,
      insuredLastName:      policy.insuredLastName,
      insuredBirthDate:     policy.insuredBirthDate
        ? new Date(policy.insuredBirthDate).toISOString().split('T')[0]
        : '',
      policyType:           policy.policyType,
      policyNumber:         policy.policyNumber,
      company:              policy.company,
      startDate:            new Date(policy.startDate).toISOString().split('T')[0],
      endDate:              new Date(policy.endDate).toISOString().split('T')[0],
      paymentFrequency:     policy.paymentFrequency,
      netPremium:           policy.netPremium,
      totalPremium:         policy.totalPremium,
      commissionPercentage: policy.commissionPercentage
    });
  }

  // ─── Acciones del Modal ─────────────────────────────────────────────────────

  /** Activa el modo edición y carga los datos en el formulario */
  enterEditMode(): void {
    if (this.policy) {
      this.patchForm(this.policy);
      this.isEditMode = true;
    }
  }

  /** Vuelve al modo detalle (solo lectura) sin guardar */
  cancelEdit(): void {
    this.isEditMode = false;
    this.editForm.markAsUntouched();
  }

  /** Envía los cambios al backend usando el GUID de la póliza */
  saveChanges(): void {
    if (this.editForm.invalid || !this.policy?.guid) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;

    this.policyService.updatePolicy(this.policy.guid, this.editForm.value).subscribe({
      next: () => {
        this.isSaving = false;
        this.isEditMode = false;
        this.updated.emit();
      },
      error: (err) => {
        console.error('Error al actualizar la póliza:', err);
        this.isSaving = false;
      }
    });
  }

  /** Cierra el modal y notifica al padre */
  close(): void {
    this.isEditMode = false;
    this.isSaving = false;
    this.closed.emit();
  }
}
