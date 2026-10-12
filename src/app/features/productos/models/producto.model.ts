export interface Producto {
  id: number;
  nombre: string;
  categoriaId: number;
  categoriaNombre: string;
  precio: number;
  stock: number;
  estado: boolean;
  fechaCreacion: string;
  fechaModificacion: string | null;
}

export interface ProductoRequest {
  nombre: string;
  categoriaId: number;
  precio: number;
  stock: number;
  estado: boolean;
}
