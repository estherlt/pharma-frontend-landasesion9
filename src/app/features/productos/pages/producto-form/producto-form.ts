import { Component, inject, input, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { erroresDeValidacion, mensajeError } from '../../../../core/utils/http-error';
import { Categoria } from '../../../categorias/models/categoria.model';
import { CategoriaService } from '../../../categorias/services/categoria-service';
import { Producto, ProductoRequest } from '../../models/producto.model';
import { ProductoService } from '../../services/producto-service';

@Component({
  selector: 'app-producto-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './producto-form.html',
  styleUrl: './producto-form.css',
})
export class ProductoForm implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly productoService = inject(ProductoService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly router = inject(Router);

  readonly id = input<string>();

  protected readonly categorias = signal<Categoria[]>([]);
  protected readonly cargando = signal(true);
  protected readonly guardando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly erroresServidor = signal<Record<string, string>>({});

  protected readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    categoriaId: this.fb.control<number | null>(null, Validators.required),
    precio: [0, [Validators.required, Validators.min(0.01)]],
    stock: [0, [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]],
    estado: [true],
  });

  protected esEdicion(): boolean {
    return !!this.id();
  }

  ngOnInit(): void {
    const id = this.id();
    forkJoin({
      categorias: this.categoriaService.listar(),
      producto: id ? this.productoService.obtener(Number(id)) : of(null as Producto | null),
    }).subscribe({
      next: ({ categorias, producto }) => {
        // En el desplegable solo categorías activas (más la actual del producto al editar).
        this.categorias.set(
          categorias.filter((c) => c.estado || c.id === producto?.categoriaId)
        );
        if (producto) {
          this.form.setValue({
            nombre: producto.nombre,
            categoriaId: producto.categoriaId,
            precio: producto.precio,
            stock: producto.stock,
            estado: producto.estado,
          });
        }
        this.cargando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(mensajeError(err));
        this.cargando.set(false);
      },
    });
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const dto: ProductoRequest = {
      nombre: v.nombre.trim(),
      categoriaId: Number(v.categoriaId),
      precio: Number(v.precio),
      stock: Number(v.stock),
      estado: v.estado,
    };
    const id = this.id();
    const peticion = id
      ? this.productoService.actualizar(Number(id), dto)
      : this.productoService.crear(dto);

    this.guardando.set(true);
    peticion.subscribe({
      next: () => this.router.navigate(['/productos']),
      error: (err: HttpErrorResponse) => {
        this.guardando.set(false);
        this.error.set(mensajeError(err));
        this.erroresServidor.set(erroresDeValidacion(err));
      },
    });
  }
}
