import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { PaginaResponse } from '../../../../core/models/pagina-response';
import { Cliente } from '../../models/cliente.model';
import { ClienteService, DireccionOrden, OrdenCliente } from '../../services/cliente-service';
import { mensajeError } from '../../../../core/utils/http-error';

const PAGINA_VACIA: PaginaResponse<Cliente> = {
  contenido: [],
  pagina: 0,
  tamanio: 10,
  totalElementos: 0,
  totalPaginas: 0,
  ultima: true,
};

@Component({
  selector: 'app-cliente-list',
  imports: [RouterLink],
  templateUrl: './cliente-list.html',
  styleUrl: './cliente-list.css',
})
export class ClienteList implements OnInit {
  private readonly clienteService = inject(ClienteService);

  protected readonly pagina = signal(0);
  protected readonly tamanio = signal(10);
  protected readonly ordenarPor = signal<OrdenCliente>('apellidos');
  protected readonly direccion = signal<DireccionOrden>('asc');

  protected readonly datos = signal<PaginaResponse<Cliente>>(PAGINA_VACIA);
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly filtro = signal('');

  protected readonly tamanios = [5, 10, 20];

  protected readonly filtrados = computed(() => {
    const texto = this.filtro().trim().toLowerCase();
    const lista = this.datos().contenido;
    if (!texto) return lista;
    return lista.filter(
      (c) =>
        c.dni.toLowerCase().includes(texto) ||
        `${c.nombres} ${c.apellidos}`.toLowerCase().includes(texto)
    );
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.clienteService
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

  ordenarPorColumna(campo: OrdenCliente): void {
    if (this.ordenarPor() === campo) {
      this.direccion.set(this.direccion() === 'asc' ? 'desc' : 'asc');
    } else {
      this.ordenarPor.set(campo);
      this.direccion.set('asc');
    }
    this.cargar();
  }

  darDeBaja(cliente: Cliente): void {
    if (!confirm(`¿Dar de baja al cliente "${cliente.nombres} ${cliente.apellidos}"?`)) {
      return;
    }
    this.clienteService.eliminar(cliente.id).subscribe({
      next: () => this.cargar(),
      error: (err: HttpErrorResponse) => this.error.set(mensajeError(err)),
    });
  }
}
