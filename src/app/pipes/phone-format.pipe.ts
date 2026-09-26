import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'phoneFormat',
  standalone: true
})
export class PhoneFormatPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return 'N/A';

    // Elimina cualquier carácter que no sea número
    const cleaned = ('' + value).replace(/\D/g, '');

    // Formato de 10 dígitos: (662) 123-4567
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }

    // Si tiene código de país (12 dígitos, ej. 526621234567): +52 (662) 123-4567
    if (cleaned.length === 12) {
      return `+${cleaned.slice(0, 2)} (${cleaned.slice(2, 5)}) ${cleaned.slice(5, 8)}-${cleaned.slice(8)}`;
    }

    // Si no cumple la longitud esperada, regresa el valor original
    return value;
  }
}