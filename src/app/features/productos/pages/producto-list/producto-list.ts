import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { PaginaResponse } from '../../../../core/models/pagina-response';
import { mensajeError } from '../../../../core/utils/http-error';
import { Producto } from '../../models/producto.model';
import { DireccionOrdenProducto, OrdenProducto, ProductoService } from '../../services/producto-service';

const PAGINA_VACIA: PaginaResponse<Producto> = {
  contenido: [],
  pagina: 0,
  tamanio: 10,
  totalElementos: 0,
  totalPaginas: 0,
  ultima: true,
};

@Component({
  selector: 'app-producto-list',
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './producto-list.html',
  styleUrl: './producto-list.css',
})
export class ProductoList implements OnInit {
  private readonly productoService = inject(ProductoService);

  protected readonly pagina = signal(0);
  protected readonly tamanio = signal(10);
  protected readonly ordenarPor = signal<OrdenProducto>('nombre');
  protected readonly direccion = signal<DireccionOrdenProducto>('asc');

  protected readonly datos = signal<PaginaResponse<Producto>>(PAGINA_VACIA);
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly filtro = signal('');

  protected readonly tamanios = [5, 10, 20];

  protected readonly filtrados = computed(() => {
    const texto = this.filtro().trim().toLowerCase();
    const lista = this.datos().contenido;
    if (!texto) return lista;
    return lista.filter(
      (p) =>
        p.nombre.toLowerCase().includes(texto) || p.categoriaNombre.toLowerCase().includes(texto)
    );
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.productoService
      .listar(this.pagina(), this.tamanio(), this.ordenarPor(), this.direccion())
      .subscribe({
        next: (respuesta) => {
          this.datos.set(respuesta);
          this.cargando.set(false);
        },
        error: (err: HttpErrorResponse) => {
          this.error.set(mensajeError(err));
          this.cargando.set(false);
        },
      });
  }

  cambiarTamanio(valor: string): void {
    this.tamanio.set(Number(valor));
    this.pagina.set(0);
    this.cargar();
  }

  anterior(): void {
    if (this.pagina() === 0) return;
    this.pagina.update((p) => p - 1);
    this.cargar();
  }

  siguiente(): void {
    if (this.datos().ultima) return;
    this.pagina.update((p) => p + 1);
    this.cargar();
  }

  ordenarPorColumna(campo: OrdenProducto): void {
    if (this.ordenarPor() === campo) {
      this.direccion.set(this.direccion() === 'asc' ? 'desc' : 'asc');
    } else {
      this.ordenarPor.set(campo);
      this.direccion.set('asc');
    }
    this.cargar();
  }

  darDeBaja(producto: Producto): void {
    if (!confirm(`¿Dar de baja el producto "${producto.nombre}"?`)) {
      return;
    }
    this.productoService.eliminar(producto.id).subscribe({
      next: () => this.cargar(),
      error: (err: HttpErrorResponse) => this.error.set(mensajeError(err)),
    });
  }
}
