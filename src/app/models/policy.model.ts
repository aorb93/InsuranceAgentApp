export interface Insured {
  id?: number;
  guid?: string;
  firstName: string;
  lastName: string;
  birthDate?: string | null;
}

export interface CreateInsuredDto {
  insuredGuid?: string | null;
  firstName: string;
  lastName: string;
  birthDate?: string | null;
}

export interface Policy {
  id?: number;
  guid?: string;
  clientId?: number;
  clientGuid?: string;
  clientName?: string;
  insureds: Insured[];
  policyType?: string;
  policyTypeId: number;
  policyNumber: string;
  company: string;
  paymentFrequency?: string;
  paymentFrequencyId: number;
  startDate: string;
  endDate: string;
  netPremium: number;
  totalPremium: number;
  commissionPercentage: number;
  createdAt?: string;
}

export interface CreateClientPoliciesRequest {
  clientGuid: string;
  policies: any[];
}