# Visual Detailing — Frontend

E-commerce frontend para **Visual Detailing**, un local de detailing automotriz. Catálogo de productos químicos, herramientas y accesorios para el cuidado de vehículos.

## Stack

| Tecnología          | Propósito                          |
| ------------------- | ---------------------------------- |
| **React 18**        | UI library                         |
| **Vite 4**          | Bundler y dev server               |
| **Tailwind CSS v4** | Styling                            |
| **React Router v6** | Navegación                         |
| **Zustand**         | Estado global (carrito, favoritos) |
| **SWR**             | Fetching y caching de datos        |
| **Axios**           | Cliente HTTP                       |
| **SweetAlert2**     | Notificaciones y confirmaciones    |

## Estructura del proyecto

```
src/
├── assets/               # Imágenes estáticas, logos
├── components/
│   ├── common/           # Íconos SVG, componentes compartidos
│   │   └── Icons/       # Sistema de íconos
│   └── shared/           # Componentes reutilizables (ProductCard, etc.)
├── context/              # Contextos React
├── pages/
│   ├── admin/            # Panel de administración
│   │   ├── Dashboard/
│   │   ├── Orders/
│   │   ├── Products/     # CRUD de productos
│   │   └── Users/
│   ├── Auth/             # Login
│   ├── Cart/             # Carrito de compras
│   ├── Contact/          # Formulario de contacto
│   ├── Favorites/        # Favoritos del usuario
│   ├── Home/             # Página principal
│   ├── ProductDetail/    # Detalle de producto
│   ├── Products/         # Catálogo
│   └── Profile/          # Perfil del usuario
├── stores/               # Stores de Zustand
│   ├── useAuthStore.js   # Autenticación + persistencia
│   ├── useCartStore.js   # Carrito
│   └── useFavoritesStore.js
└── App.jsx               # entry point
```

## Scripts

```bash
npm run dev          # Dev server con HMR (http://localhost:5173)
npm run build        # Build de producción
npm run preview      # Preview del build de producción
```

### Variables de entorno

No requiere variables de entorno propias. La autenticación se maneja mediante JWT guardado en `localStorage` a través del store de Zustand.

## Arquitectura de estado

### Carrito y Favoritos

El carrito y los favoritos viven en el **backend** (MongoDB), pero el frontend mantiene una copia en **Zustand con persistencia** (localStorage) para:

- Mostrar el badge en el header instantáneamente
- Mantener el estado entre navigaciones
- Sincronizar con el backend después de cada operación

```
Accion del usuario
    → POST al backend (autoridad)
    → GET al backend (trae estado completo)
    → syncFromBackend() → actualiza Zustand
    → UI re-renderiza con datos reales
```

### API Response Format

Todas las APIs del backend devuelven:

```json
{
  "success": true,
  "data": { ... },
  "message": "Producto actualizado"
}
```

El fetcher de SWR ya está configurado para extraer `res.data.data`.

## Rutas principales

| Ruta             | Descripción                     |
| ---------------- | ------------------------------- |
| `/`              | Home                            |
| `/productos`     | Catálogo con filtros y búsqueda |
| `/productos/:id` | Detalle de producto             |
| `/carrito`       | Carrito de compras              |
| `/favoritos`     | Favoritos del usuario           |
| `/login`         | Inicio de sesión                |
| `/perfil`        | Perfil del usuario              |
| `/adm/*`         | Panel de administración         |

## Sistema de diseño

- **Tema**: Dark mode (`bg-gray-950`, `gray-900/50`, `white/5`)
- **Acentos**: Amarillo (`yellow-500`), Verde (`green-400`), Rojo (`red-400`)
- **Componentes**: Cards con bordes sutiles, bordes redondeados (`rounded-2xl`), transiciones suaves
- **Íconos**: Sistema de SVG inline custom en `components/common/Icons/`

## Dependencias destacadas

```json
{
  "zustand": "^5.0.12",
  "swr": "^2.4.1",
  "sweetalert2": "^11.7.12",
  "tailwindcss": "^4.2.2"
}
```

## Deployment

Build con Vite, sirve estáticamente. Compatible con Vercel, Netlify, Cloudflare Pages.

```bash
npm run build
# dist/ → servir estáticamente
```
