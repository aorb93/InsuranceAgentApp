export interface Policy {
  id?: number;
  clientId: number;
  insuredFirstName: string;
  insuredLastName: string;
  insuredBirthDate?: string;
  policyType: string;         // Ej: "Vida", "Gastos Médicos", "Auto", "Daños"
  policyNumber: string;
  company: string;            // Ej: "GNP", "AXA", "Qualitas", "Monterrey"
  startDate: string;          // Fecha inicio vigencia
  endDate: string;            // Fecha fin vigencia
  paymentFrequency: string;   // "Mensual", "Trimestral", "Semestral", "Anual"
  netPremium: number;
  totalPremium: number;
  commissionPercentage: number;
}