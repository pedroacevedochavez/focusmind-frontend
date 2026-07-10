import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { MetodoPago } from '../../models/pedido/pedido';

export interface ClientePago {
  nombreCompleto: string;
  direccion: string;
  ciudad: string;
  telefono: string;
}

export interface PaymentRequest {
  monto: number;
  metodoPago: MetodoPago;
  numeroTarjeta?: string;
  cliente: ClientePago;
}

export interface PaymentResponse {
  exito: boolean;
  transaccionId: string;
}

// ══════════════════════════════════════════════════════════════════
//  PaymentService — abstrae la pasarela de pago. El Checkout solo conoce
//  esta interfaz (procesarPago), por lo que la implementación interna puede
//  sustituirse por un http.post hacia el backend real sin tocar la vista.
// ══════════════════════════════════════════════════════════════════
@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly endpoint = '/api/payments';

  procesarPago(payload: PaymentRequest): Observable<PaymentResponse> {
    // return this.http.post<PaymentResponse>(this.endpoint, payload);
    return of<PaymentResponse>({
      exito: true,
      transaccionId: `TXN-${Date.now()}`,
    }).pipe(delay(300));
  }
}
