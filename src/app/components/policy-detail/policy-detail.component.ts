import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { Policy, Insured } from '../../models/policy.model';
import { PolicyService } from '../../services/policy.service';
import { CatalogItem } from '../../models/catalog.model';
import { CatalogService } from '../../services/catalog.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-policy-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './policy-detail.component.html',
  styleUrls: ['./policy-detail.component.css']
})
export class PolicyDetailComponent implements OnInit, OnChanges {
  @Input() policy: Policy | null = null;
  @Input() show: boolean = false;

  @Output() closed = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();

  isEditMode: boolean = false;
  isSaving: boolean = false;

  editForm!: FormGroup;

  policyTypes: CatalogItem[] = [];
  paymentFrequencies: CatalogItem[] = [];

  constructor(
    private fb: FormBuilder,
    private policyService: PolicyService,
    private catalogService: CatalogService
  ) {
    this.buildForm();
  }

  ngOnInit(): void {
    this.loadCatalogs();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['policy'] && this.policy) {
      this.isEditMode = false;
      this.isSaving = false;
    }
    if (changes['show'] && !this.show) {
      this.isEditMode = false;
      this.isSaving = false;
    }
  }

  private buildForm(): void {
    this.editForm = this.fb.group({
      insureds: this.fb.array([]),
      policyTypeId: ['', Validators.required],
      policyNumber: ['', Validators.required],
      company: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      paymentFrequencyId: ['', Validators.required],
      netPremium: [0, [Validators.required, Validators.min(0)]],
      totalPremium: [0, [Validators.required, Validators.min(0)]],
      commissionPercentage: [0, [Validators.required, Validators.min(0), Validators.max(100)]]
    });
  }

  get insuredsArray(): FormArray {
    return this.editForm.get('insureds') as FormArray;
  }

  newInsuredGroup(insured?: Insured): FormGroup {
    return this.fb.group({
      insuredGuid: [insured?.guid || null],
      firstName: [insured?.firstName || '', Validators.required],
      lastName: [insured?.lastName || '', Validators.required],
      birthDate: [insured?.birthDate ? new Date(insured.birthDate).toISOString().split('T')[0] : '']
    });
  }

  addInsured(): void {
    if (this.insuredsArray.invalid) {
      this.insuredsArray.markAllAsTouched();
      return;
    }
    this.insuredsArray.push(this.newInsuredGroup());
  }

  removeInsured(index: number): void {
    if (this.insuredsArray.length > 1) {
      this.insuredsArray.removeAt(index);
    }
  }

  private patchForm(policy: Policy): void {
    this.insuredsArray.clear();
    if (policy.insureds && policy.insureds.length > 0) {
      policy.insureds.forEach(i => this.insuredsArray.push(this.newInsuredGroup(i)));
    } else {
      this.insuredsArray.push(this.newInsuredGroup());
    }

    this.editForm.patchValue({
      policyTypeId: policy.policyTypeId,
      policyNumber: policy.policyNumber,
      company: policy.company,
      startDate: new Date(policy.startDate).toISOString().split('T')[0],
      endDate: new Date(policy.endDate).toISOString().split('T')[0],
      paymentFrequencyId: policy.paymentFrequencyId,
      netPremium: policy.netPremium,
      totalPremium: policy.totalPremium,
      commissionPercentage: policy.commissionPercentage
    });
  }

  enterEditMode(): void {
    if (this.policy) {
      this.patchForm(this.policy);
      this.isEditMode = true;
    }
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.editForm.markAsUntouched();
  }

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

  close(): void {
    this.isEditMode = false;
    this.isSaving = false;
    this.closed.emit();
  }

  private loadCatalogs(): void {
    forkJoin({
      types: this.catalogService.getPolicyTypes(),
      frequencies: this.catalogService.getPaymentFrequencies()
    }).subscribe({
      next: (res) => {
        this.policyTypes = res.types;
        this.paymentFrequencies = res.frequencies;
      },
      error: (err) => console.error('Error al cargar catálogos de pólizas:', err)
    });
  }
}