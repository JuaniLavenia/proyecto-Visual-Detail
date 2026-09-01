# Proposal: Admin Dashboard y Gestión de Pedidos

## Intent

El administrador actual no tiene visibilidad del negocio: no puede ver métricas de ventas, estado de pedidos ni stock global. Necesita un panel de control centralizado para tomar decisiones informadas y gestionar pedidos pendientes sin depender del usuario final.

## Scope

### In Scope

- Dashboard (`/adm`) con métricas:	total de pedidos, ventas por estado, productos con stock bajo
- Página de pedidos (`/adm/pedidos`) con filtros por estado (Pendiente/Completado/Cancelado)
- Menú expandido en Header con accesos: Dashboard, Pedidos, Productos, Usuarios
- Backend: nuevo endpoint `/admin/pedidos` para obtener todos los pedidos
- Backend: nuevo endpoint `/admin/pedidos/stats` para métricas agregadas

### Out of Scope

- Gráficos avanzados o analytics (fecha límite)
- Exportación a CSV/PDF
- Modificaciones en flujo de compra del usuario normal
--panel de control de inventario

## Capabilities

### New Capabilities

- `admin-dashboard`: Pantalla principal con métricas de negocio (pedidos totales, ventas, stock)
- `admin-orders-list`: Lista de pedidos con filtros por estado y búsqueda
- `admin-header-menu`: Menú de navegación expandido para admin

### Modified Capabilities

- Ninguno por ahora (es funcionalidade netamente nueva)

## Approach

Implementación completa en paralelo backend/frontend:

1. Backend: exponer `findAll` del servicio Pedido + nuevo endpoint de stats
2. Frontend: crear página Dashboard con cards de métricas
3. Frontend: crear página Pedidos con tabla y filtros
4. Frontend: modificar Header para menú dropdown de admin

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `dist/servers/api.js` o similar | Modificado | Endpoints nuevos para admin |
| `src/pages/admin/Dashboard/` | Nuevo | Página de métricas |
| `src/pages/admin/Orders/` | Nuevo | Lista de pedidos |
| `src/components/layout/Header.jsx` | Modificado | Menú expandido |
| `src/App.jsx` | Modificado | Rutas `/adm` y `/adm/pedidos` |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| No hay endpoint de stats en backend | Alto | Crear endpoint antes del frontend |
| Autenticación admin no diferenciada | Medium | Verificar que rutas admin requieran rol admin |

## Rollback Plan

1. Revertir cambios en backend (eliminar endpoints)
2. Eliminar rutas `/adm` y `/adm/pedidos` de App.jsx
3. Eliminar carpeta `src/pages/admin/Dashboard` y `src/pages/admin/Orders`
4. Restaurar Header original

## Dependencies

- Ninguna dependencia externa
- Requiere que el modelo Pedido tenga campo `estado` (ya existe según exploración)

## Success Criteria

- [ ] Endpoint `/admin/pedidos` devuelve lista de todos los pedidos
- [ ] Endpoint `/admin/pedidos/stats` devuelve métricas (totales, por estado)
- [ ] Ruta `/adm` muestra dashboard con métricas reales
- [ ] Ruta `/adm/pedidos` muestra tabla con filtros funcionales
- [ ] Header muestra menú dropdown con accesos a Dashboard, Pedidos, Productos, Usuarios