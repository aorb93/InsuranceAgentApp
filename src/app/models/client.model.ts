export interface Client {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  identificationNumber?: string; // RFC o ID
  isActive: boolean;
  createdAt?: Date;
}