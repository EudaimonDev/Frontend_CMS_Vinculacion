## Estructura

```
src/app/frontoffice/
├── core/                          ← Servicios, modelos y pipes reutilizables
│   ├── models/
│   │   ├── article.model.ts       ← Interfaz Article y ArticleCategory
│   │   ├── block.model.ts         ← Tipos de bloques del CMS
│   │   └── page.model.ts          ← Interfaz Page
│   ├── services/
│   │   └── cms.service.ts         ← Servicio de datos (mock → reemplazar con HTTP)
│   └── pipes/
│       └── reading-time.pipe.ts   ← Pipe: 5 → "5 min lectura"
│
├── blocks/                        ← Componentes que entienden el CMS
│   ├── block-renderer/            ← Dispatcher: elige qué bloque renderizar
│   ├── hero-block/                ← Sección hero con publicación destacada
│   ├── cards-grid/                ← Grid de 3 tarjetas de artículos
│   └── gallery-grid/              ← Galería visual de categorías
│
├── shared/                        ← UI reutilizable sin lógica de negocio
│   ├── components/
│   │   ├── article-card/          ← Tarjeta individual de artículo
│   │   ├── category-badge/        ← Badge de categoría con color
│   │   └── navbar/                ← Barra de navegación superior
│   └── layouts/
│       └── page-layout.component  ← Navbar + router-outlet + footer
│
├── pages/                         ← Una carpeta por ruta
│   ├── home/                      ← Página de inicio (carga bloques del CMS)
│   ├── category/                  ← Listado de artículos por categoría
│   └── article-detail/            ← Detalle de un artículo
│
└── frontoffice.routes.ts          ← Rutas del módulo
```

## Rutas disponibles

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/` | `HomeComponent` | Landing con bloques del CMS |
| `/articulo/:id` | `ArticleDetailComponent` | Detalle de artículo |
| `/categoria/:slug` | `CategoryComponent` | Listado por categoría |

## Agregar un nuevo bloque

1. Definir interfaz en `core/models/block.model.ts`
2. Crear la carpeta en `blocks/nuevo-bloque/`
3. Agregarlo al `block-renderer` con un nuevo `*ngSwitchCase`
4. El CMS solo necesita retornar `{ type: 'nuevo-bloque', data: {...} }`
