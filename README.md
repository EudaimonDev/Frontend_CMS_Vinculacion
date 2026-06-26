# Portal Obstétrico — CMS Obstetricia

Sistema de gestión de contenidos (CMS) desarrollado para el **Departamento de Obstetricia de la Universidad de Guayaquil**, en alianza con **Misión Alianza**. Permite administrar páginas, catálogos, multimedia y usuarios desde un panel de administración, mientras que el sitio público renderiza el contenido de forma dinámica mediante bloques configurables.

---

## Tecnologías

| Herramienta | Versión |
|---|---|
| Angular CLI | 20.2.0 |
| Node.js | 20.19.4 |
| TypeScript | ~5.5 |
| SCSS | — |

---

## Descripción del sistema

El proyecto está dividido en dos grandes áreas:

### Back Office
Panel de administración de acceso restringido (`/admin`). Permite a editores y administradores:
- Gestionar páginas y su contenido por bloques
- Administrar catálogos
- Subir y organizar archivos multimedia
- Gestionar usuarios y roles
- Configurar ajustes del sistema

### Front Office
Sitio público (`/`). Renderiza las páginas configuradas desde el back office mediante un sistema de **bloques de contenido** (hero, texto, imagen, tarjetas, call-to-action), lo que permite modificar la apariencia del sitio sin tocar código.

---

## Estructura de carpetas

```
Cms-obstreticia/
│
├── public/                          # Assets estáticos (servidos desde la raíz)
│   ├── favicon.ico
│   └── images/                      # Imágenes, logos, etc.
│       ├── logo-alianza.png
│       └── logo-ug.png
│
├── src/
│   ├── environments/
│   │   ├── environment.ts           # Variables de entorno desarrollo
│   │   └── environment.prod.ts      # Variables de entorno producción
│   │
│   ├── app/
│   │   ├── app.ts                   # Componente raíz
│   │   ├── app.config.ts            # Configuración de la aplicación (providers)
│   │   ├── app.routes.ts            # Rutas principales (lazy loading)
│   │   │
│   │   ├── core/                    # Capa singleton — servicios, guards, interceptores
│   │   │   ├── guards/
│   │   │   │   └── auth.guard.ts    # authGuard (protege rutas privadas)
│   │   │   │                        # noAuthGuard (redirige si ya está autenticado)
│   │   │   ├── interceptors/
│   │   │   │   └── auth.interceptor.ts   # Agrega Bearer token a cada petición HTTP
│   │   │   ├── models/
│   │   │   │   └── user.model.ts    # Interfaces: User, LoginCredentials, AuthResponse
│   │   │   └── services/
│   │   │       └── auth.service.ts  # Autenticación con Signals (login, logout, estado)
│   │   │
│   │   ├── backoffice/              # Módulo del panel de administración
│   │   │   ├── backoffice.routes.ts # Rutas del back office (lazy)
│   │   │   │
│   │   │   ├── auth/
│   │   │   │   └── login/           # Página de inicio de sesión
│   │   │   │       ├── login.component.ts
│   │   │   │       ├── login.component.html
│   │   │   │       └── login.component.scss
│   │   │   │
│   │   │   ├── layout/              # Shell del panel de administración
│   │   │   │   ├── main-layout/     # Layout principal (sidebar + header + router-outlet)
│   │   │   │   ├── sidebar/         # Navegación lateral colapsable
│   │   │   │   └── header/          # Barra superior con usuario y logout
│   │   │   │
│   │   │   ├── dashboard/           # Página principal del admin (estadísticas + actividad)
│   │   │   │
│   │   │   ├── catalogs/            # Gestión de catálogos e ítems reutilizables
│   │   │   │   ├── catalogs.routes.ts
│   │   │   │   ├── models/          # Interfaces de catálogos e ítems
│   │   │   │   ├── services/        # Servicio mock CRUD con Signals
│   │   │   │   ├── catalogs-list/   # Listado, filtros, KPIs y acciones CRUD
│   │   │   │   └── catalog-editor/  # Editor de catálogo + CRUD de ítems
│   │   │   │
│   │   │   └── shared/              # Componentes UI reutilizables del back office
│   │   │       └── components/
│   │   │           ├── page-header/ # Encabezado de página con breadcrumb y slot de acciones
│   │   │           ├── status-badge/# Badge de estado (published, draft, archived…)
│   │   │           └── modal/       # Diálogo modal reutilizable (default / danger)
│   │   │
│   │   └── frontoffice/             # Módulo del sitio público
│   │       ├── frontoffice.routes.ts
│   │       │
│   │       ├── home/                # Página de inicio pública
│   │       │   └── .component.ts
│   │       │
│   │       └── blocks/              # Sistema de bloques de contenido CMS
│   │           ├── models/
│   │           │   └── block.model.ts       # Interfaces de todos los tipos de bloque
│   │           ├── block-renderer/          # Renderizador dinámico de bloques
│   │           ├── hero-block/              # Bloque: banner principal con CTA
│   │           ├── text-block/              # Bloque: contenido HTML enriquecido
│   │           ├── image-block/             # Bloque: imagen con pie de foto
│   │           ├── cards-grid/              # Bloque: cuadrícula de tarjetas
│   │           └── cta-block/               # Bloque: sección call-to-action
│   │
│   ├── styles.scss                  # Variables CSS globales, reset y utilidades
│   ├── index.html
│   └── main.ts
│
├── angular.json                     # Configuración del proyecto Angular
├── tsconfig.json
└── package.json
```

---

## Rutas

| URL | Acceso | Descripción |
|---|---|---|
| `/` | Público | Sitio público — renderiza bloques de la  |
| `/admin/login` | Público | Inicio de sesión del panel |
| `/admin/dashboard` | Privado | Dashboard principal con estadísticas |
| `/admin/pages` | Privado | Gestión de páginas y contenido por bloques |
| `/admin/catalogs` | Privado | Listado principal de catálogos, filtros y acciones CRUD |
| `/admin/catalogs/new` | Privado | Crear un catálogo y registrar sus ítems |
| `/admin/catalogs/:id/edit` | Privado | Editar metadatos del catálogo y administrar sus ítems |
| `/admin/media` | Privado | Gestión de multimedia *(próximamente)* |
| `/admin/users` | Privado | Gestión de usuarios *(próximamente)* |
| `/admin/settings` | Privado | Configuración del sistema *(próximamente)* |

---

## Cómo levantar el proyecto

### Requisitos previos

- **Node.js** v20.x — [descargar](https://nodejs.org)
- **Angular CLI** v20.x

```bash
npm install -g @angular/cli@20
```

### Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/Edins0101/Cms-obstreticia.git
cd Cms-obstreticia

# 2. Instalar dependencias
npm install
```

### Desarrollo

```bash
ng serve
```

Abre el navegador en `http://localhost:4200`.

| URL | Descripción |
|---|---|
| `http://localhost:4200/` | Sitio público |
| `http://localhost:4200/admin/login` | Panel de administración |
| `http://localhost:4200/admin/catalogs` | Módulo de catálogos del backoffice |

### Módulo de catálogos

El módulo de catálogos ya está disponible en el backoffice y funciona completamente en modo mock desde la ruta:

```text
http://localhost:4200/admin/catalogs
```

Desde esta pantalla se puede:

- Crear catálogos
- Editar metadatos del catálogo
- Duplicar catálogos
- Eliminar catálogos
- Crear, editar, reordenar, destacar, activar o eliminar ítems dentro de cada catálogo

### Credenciales de prueba (mock)

> El proyecto incluye autenticación simulada — no requiere backend para probar el login.

| Correo | Contraseña | Rol |
|---|---|---|
| `admin@clinica.com` | `admin123` | Administrador |
| `editor@clinica.com` | `editor123` | Editor |

### Build de producción

```bash
ng build
```

Los archivos compilados quedan en `dist/cms-obstetricia/`.

---

## Assets

Los archivos estáticos (imágenes, íconos, fuentes) se colocan en la carpeta `public/` y se acceden desde la raíz del servidor:

```
public/images/logo-alianza.png  →  /images/logo-alianza.png
```

---

## Convenciones del proyecto

- **Standalone components** — sin NgModules
- **Signals** — para estado reactivo (`signal`, `computed`)
- **Control flow** — sintaxis `@if`, `@for`, `@switch` de Angular 17+
- **Lazy loading** — todas las rutas cargan sus módulos bajo demanda
- **SCSS con variables CSS** — design system definido en `src/styles.scss`
