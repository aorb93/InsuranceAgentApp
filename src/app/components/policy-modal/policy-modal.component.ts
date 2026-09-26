import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { Client } from '../../models/client.model';
import { PolicyService } from '../../services/policy.service';
import { CatalogItem } from '../../models/catalog.model';
import { CatalogService } from '../../services/catalog.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-policy-modal',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule ],
  templateUrl: './policy-modal.component.html',
  styleUrls: ['./policy-modal.component.css']
})
export class PolicyModalComponent implements OnInit, OnChanges {
  @Input() client: Client | null = null;
  @Input() showPrompt: boolean = false;
  @Input() showForm: boolean = false;

  @Output() completed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  policyForm!: FormGroup;
  showPolicySection: boolean = false;

  policyTypes: CatalogItem[] = [];
  paymentFrequencies: CatalogItem[] = [];

  constructor(
    private fb: FormBuilder,
    private policyService: PolicyService,
    private catalogService: CatalogService
  ) {
    this.initPolicyForm();
  }

  ngOnInit(): void {
    this.loadCatalogs();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['client'] && this.client) {
      this.resetForms();
    }

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

  initPolicyForm(): void {
    this.policyForm = this.fb.group({
      policies: this.fb.array([])
    });
  }

  get policies(): FormArray {
    return this.policyForm.get('policies') as FormArray;
  }

  getInsureds(policyIndex: number): FormArray {
    return this.policies.at(policyIndex).get('insureds') as FormArray;
  }

  newInsuredGroup(firstName = '', lastName = '', birthDate = ''): FormGroup {
    return this.fb.group({
      insuredGuid: [null],
      firstName: [firstName, Validators.required],
      lastName: [lastName, Validators.required],
      birthDate: [birthDate]
    });
  }

  newPolicyGroup(): FormGroup {
    let formattedBirthDate = '';
    if (this.client?.birthDate) {
      formattedBirthDate = new Date(this.client.birthDate).toISOString().split('T')[0];
    }

    // Por defecto agrega 1 asegurado prellenado con los datos del cliente
    const defaultInsured = this.newInsuredGroup(
      this.client?.firstName || '',
      this.client?.lastName || '',
      formattedBirthDate
    );

    return this.fb.group({
      insureds: this.fb.array([defaultInsured]),
      policyTypeId: ['', Validators.required],
      policyNumber: ['', Validators.required],
      company: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      paymentFrequencyId: ['', Validators.required],
      netPremium: ['', [Validators.required, Validators.min(0)]],
      totalPremium: ['', [Validators.required, Validators.min(0)]],
      commissionPercentage: ['', [Validators.required, Validators.min(0), Validators.max(100)]]
    });
  }

  addPolicyField(): void {
    if (this.policies.length > 0 && this.policies.invalid) {
      this.policies.markAllAsTouched();
      return;
    }
    this.policies.push(this.newPolicyGroup());
  }

  removePolicyField(index: number): void {
    this.policies.removeAt(index);
  }

  addInsuredField(policyIndex: number): void {
    const insureds = this.getInsureds(policyIndex);
    if (insureds.invalid) {
      insureds.markAllAsTouched();
      return;
    }
    insureds.push(this.newInsuredGroup());
  }

  removeInsuredField(policyIndex: number, insuredIndex: number): void {
    const insureds = this.getInsureds(policyIndex);
    if (insureds.length > 1) {
      insureds.removeAt(insuredIndex);
    }
  }

  onPromptResponse(wantToAddPolicies: boolean): void {
    this.showPrompt = false;

    if (wantToAddPolicies) {
      this.showPolicySection = true;
      this.policies.clear();
      this.addPolicyField();
    } else {
      this.resetForms();
      this.cancelled.emit();
    }
  }

  onSubmitPolicies(): void {
    if (this.policyForm.invalid || !this.client?.guid) {
      this.policyForm.markAllAsTouched();
      return;
    }

    const rawPolicies = this.policies.value;

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