# Informe — Reto 02: módulo Clientes

**Curso:** Lenguaje de Programación II · Sesión 7 (Guía Práctica)
**Proyecto:** pharma-frontend
**Fecha límite:** 30/09/2026, 23:59

## 1. Módulos de la aplicación

| Módulo | Ruta base | Responsabilidad |
|---|---|---|
| `core` | — | `config/menu.ts` (arreglo `MenuItem`), `models/error-response.ts` (espejo del `ErrorResponseDTO`), `utils/http-error.ts` (`mensajeError` / `erroresDeValidacion`). |
| `shared` | `**` | Página 404 (`no-encontrado`, plantilla inline) para cualquier ruta inexistente. |
| `layout` | — | `header` (marca + menú bar + botón ☰), `sidebar` (recorre `MENU` con `@for`), `main-layout` (ruta padre con CSS Grid; no se recarga al navegar). |
| `features/inicio` | `/inicio` | Página de bienvenida. |
| `features/categorias` | `/categorias` | CRUD de Categorías (Reto 01) contra `/api/v1/categorias`. |
| `features/clientes` | `/clientes` | CRUD de Clientes (Reto 02), mismo patrón que Categorías, contra `/api/v1/clientes`. |

## 2. Rutas

```
/                        → redirige a /inicio
/inicio                  → Inicio (loadComponent, title: 'Inicio')
/categorias               → CategoriaList (loadChildren)
/categorias/nuevo         → CategoriaForm
/categorias/:id/editar    → CategoriaForm
/clientes                 → ClienteList (loadChildren)
/clientes/nuevo            → ClienteForm
/clientes/:id/editar       → ClienteForm
**                        → NoEncontrado (title: 'Página no encontrada')
```

`categorias` y `clientes` se cargan con `loadChildren` (carga diferida): el
navegador no descarga ese módulo hasta que el usuario entra a él.
`withComponentInputBinding()` en `app.config.ts` permite que `:id` llegue
como `input<string>()` al formulario, sin usar `ActivatedRoute` manualmente.

## 3. Menú

`core/config/menu.ts` define un único arreglo `MenuItem { etiqueta, ruta,
icono }`. El sidebar lo recorre con `@for` y usa `routerLinkActive` para
resaltar la opción actual. Agregar Clientes fue una línea:

```ts
{ etiqueta: 'Clientes', ruta: '/clientes', icono: '👥' }
```

## 4. Responsabilidades por capa (aplicado a Clientes)

- **Modelo** (`models/cliente.model.ts`): `Cliente` (con `id`, `estado`,
  `fechaCreacion`, `fechaModificacion`, como en `Categoria`) y `ClienteRequest`
  (sin los campos de auditoría, como espera el backend al crear/actualizar).
- **Servicio** (`services/cliente-service.ts`): único punto que conoce la URL
  de la API; expone `listar`, `obtener`, `crear`, `actualizar`, `eliminar`,
  todas devolviendo `Observable`.
- **Páginas** (`cliente-list`, `cliente-form`): guardan su estado en
  `signal()`/`computed()`; nunca usan `HttpClient` directamente, siempre pasan
  por el servicio.
- **Rutas del módulo** (`clientes.routes.ts`): registradas en `app.routes.ts`
  con `loadChildren`, igual que Categorías.

## 5. Validaciones y manejo de errores

El formulario usa `ReactiveFormsModule` con `NonNullableFormBuilder` y las
mismas validaciones de estilo que Categorías (`required`, `minLength`,
`maxLength`; documento entre 8 y 15 caracteres). Los errores del backend se
traducen con las mismas utilidades de `core/utils/http-error.ts`:

- **status 0** → sin conexión / CORS no autorizado.
- **400** → `validationErrors` del `ErrorResponseDTO`, mostrados por campo.
- **404** → cliente no encontrado (p. ej. al editar uno ya eliminado).
- **409** → regla de negocio (p. ej. documento duplicado).

## 6. Pendiente antes de entregar

- [ ] Confirmar que PharmaBackend expone `/api/v1/clientes` con esta forma
      exacta de datos (`ClienteResponseDTO`/`ClienteRequestDTO`); ajustar el
      modelo si los nombres de campo reales difieren.
- [ ] Adjuntar capturas del CRUD de Clientes funcionando contra PharmaBackend
      (mismo criterio que las 12 pruebas del Paso 11 para Categorías).
- [ ] Confirmar rama de trabajo y commits siguiendo la convención
      `feat(clientes): ...` pedida en el Paso 12.
- [ ] Convertir este informe a `.docx` si el docente lo pide en ese formato.
