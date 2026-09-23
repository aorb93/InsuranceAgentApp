export interface Client {
  id?: number;
  agentId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  identificationNumber?: string;
  birthDate?: string;     // Formato ISO (YYYY-MM-DD) desde el API
  city?: string;
  clientType: number;      // 1 = Cliente, 2 = Prospecto
  isActive: boolean;
  createdAt?: string;
}

export interface CreateClientDto {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  identificationNumber?: string;
  birthDate?: string;
  city?: string;
  clientType: number;
  isActive: boolean;
}

export interface UpdateClientDto extends CreateClientDto {}