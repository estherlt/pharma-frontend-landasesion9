# pharma-frontend

SPA en Angular — Sesión 7, Lenguaje de Programación II (UPeU) — que consume
PharmaBackend (Unidad I). Corresponde a la Guía Práctica "Creación y
arquitectura de la SPA: layout, navegación y CRUD de una tabla independiente".

## Requisitos previos

| Herramienta | Versión mínima | Verificar con |
|---|---|---|
| Node.js | 20.19+ o 22 (LTS) | `node -v` |
| Angular CLI | 20.x | `ng version` |
| Git | 2.40+ | `git --version` |
| PharmaBackend | rama `feature/consultas-reportes` (u.o. `master` cuando se fusione), H2 en memoria (por defecto) u Oracle con el perfil `oracle` | `http://localhost:8080/swagger-ui/index.html` |

> Si tu Angular CLI es anterior a la 22, verás `header.component.ts` /
> `HeaderComponent` en vez de `header.ts` / `Header`, y
> `@Injectable({ providedIn: 'root' })` en vez de `@Service()` en los
> servicios (ya dejado así en este proyecto para máxima compatibilidad).

## PharmaBackend: CORS

La SPA corre en `http://localhost:4200` y la API en `http://localhost:8080`
(orígenes distintos). Verifica que `CorsConfig` del backend permita `http://localhost:4200` (sin barra
final) y los métodos `GET, POST, PUT, DELETE, OPTIONS`.

## Instalación y arranque

```bash
npm install
npm start          # http://localhost:4200
```

## Estructura

```
src/app/
├── core/         config/menu.ts · models/error-response.ts · utils/http-error.ts
├── shared/       pages/no-encontrado (404, plantilla inline)
├── layout/       header · sidebar · main-layout (CSS Grid, área header/sidebar/main)
├── features/
│   ├── inicio/
│   ├── categorias/   CRUD (Reto 01) — Categoria { id, nombre, descripcion, estado, fechaCreacion, fechaModificacion }
│   └── clientes/     CRUD (Reto 02) — mismo patrón
├── app.config.ts app.routes.ts app.ts (plantilla inline, sin app.html/app.css)
src/environments/environment.ts, environment.development.ts (solo apiUrl)
src/styles.css   clases globales compartidas: .card .page-header .input .btn .btn-primary .btn-peligro .alerta .tabla .badge
```

## Pruebas manuales (Paso 11 de la guía)

Con PharmaBackend y `ng serve` corriendo, revisa la consola (F12 → Red) y
prueba en orden: cargar `/inicio`, entrar a Categorías, filtrar, registrar con
nombre corto (400 de validación), registrar con nombre duplicado (409),
registrar válido (201), editar y desmarcar Activo (200), eliminar una
categoría con productos (409) y una sin productos (204), apagar el backend y
recargar (mensaje "No se pudo conectar…"), navegar a una ruta inexistente
(404) y alternar el botón ☰.

## Versionado (Paso 12)

```bash
git init && git add . && git commit -m "chore: crear proyecto Angular pharma-frontend"
git branch -M main
git checkout -b develop
git checkout -b feature/spa-categorias-<apellido>
# ... commits feat(layout), feat(categorias): listar/registrar-editar/eliminar ...
```
