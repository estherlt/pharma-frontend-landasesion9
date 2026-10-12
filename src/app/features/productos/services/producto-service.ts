import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaginaResponse } from '../../../core/models/pagina-response';
import { Producto, ProductoRequest } from '../models/producto.model';

export type OrdenProducto = 'id' | 'nombre' | 'precio' | 'stock';
export type DireccionOrdenProducto = 'asc' | 'desc';

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/productos`;

  listar(
    pagina = 0,
    tamanio = 10,
    ordenarPor: OrdenProducto = 'nombre',
    direccion: DireccionOrdenProducto = 'asc'
  ): Observable<PaginaResponse<Producto>> {
    const params = new HttpParams()
      .set('pagina', pagina)
      .set('tamanio', tamanio)
      .set('ordenarPor', ordenarPor)
      .set('direccion', direccion);
    return this.http.get<PaginaResponse<Producto>>(this.url, { params });
  }

  obtener(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.url}/${id}`);
  }

  crear(dto: ProductoRequest): Observable<Producto> {
    return this.http.post<Producto>(this.url, dto);
  }

  actualizar(id: number, dto: ProductoRequest): Observable<Producto> {
    return this.http.put<Producto>(`${this.url}/${id}`, dto);
  }

  /** Baja lógica: el producto queda inactivo. */
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
