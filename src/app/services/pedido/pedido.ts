import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MetodoPago, Pedido, PedidoConfirmado, PedidoEntrada } from '../../models/pedido/pedido';

interface PedidoDetalleItemDto {
  idProducto: number;
  nombreProducto: string;
  precioUnitario: number;
  cantidad: number;
  subtotal: number;
}

// Forma de FocusMind.DTO.Responses.PedidoResponseDto (POST /api/pedidos).
interface PedidoResponseDto {
  idPedido: number;
  numeroPedido: string;
  fechaPedido: string;
  total: number;
  nombreCliente: string;
  direccionEnvio: string;
  ciudadEnvio: string;
  telefonoContacto: string;
  metodoPago: string;
  items: PedidoDetalleItemDto[];
}

// Forma de FocusMind.DTO.Responses.PedidoListItemResponseDto (GET /api/pedidos).
interface PedidoListItemDto {
  idPedido: number;
  numeroPedido: string;
  fechaPedido: string;
  total: number;
  direccionEnvio: string;
  ciudadEnvio: string;
  metodoPago: string;
}

// ══════════════════════════════════════════════════════════════════
//  FocusMind S.A.C. — pedido.service.ts
//  HU-19: reemplaza el registro en cookie por POST /api/pedidos (HU-18,
//  transacción ACID con descuento real de stock). El carrito sigue
//  viviendo 100% en el Frontend (CartService, sin tabla de carrito
//  persistente — decisión de HU-17); este servicio solo confirma la
//  compra ya armada por CheckoutComponent y expone el historial real.
// ══════════════════════════════════════════════════════════════════
@Injectable({ providedIn: 'root' })
export class PedidoService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${environment.apiUrl}/pedidos`;

  private readonly _historial = signal<Pedido[]>([]);
  readonly historial = this._historial.asReadonly();

  confirmar(entrada: PedidoEntrada): Observable<PedidoConfirmado> {
    return this.http.post<PedidoResponseDto>(this.endpoint, entrada).pipe(map(dto => this.mapearConfirmado(dto)));
  }

  /** Historial del usuario autenticado (GET /api/pedidos) — requiere sesión activa. */
  cargarHistorial(): void {
    this.http
      .get<PedidoListItemDto[]>(this.endpoint)
      .pipe(map(items => items.map(item => this.mapearResumen(item))))
      .subscribe(historial => this._historial.set(historial));
  }

  private mapearResumen(dto: PedidoListItemDto): Pedido {
    return {
      id: dto.numeroPedido,
      fecha: dto.fechaPedido,
      total: dto.total,
      direccionEnvio: dto.direccionEnvio,
      ciudadEnvio: dto.ciudadEnvio,
      metodoPago: dto.metodoPago as MetodoPago,
    };
  }

  private mapearConfirmado(dto: PedidoResponseDto): PedidoConfirmado {
    return {
      ...this.mapearResumen(dto),
      nombreCliente: dto.nombreCliente,
      telefonoContacto: dto.telefonoContacto,
      items: dto.items,
    };
  }
}
