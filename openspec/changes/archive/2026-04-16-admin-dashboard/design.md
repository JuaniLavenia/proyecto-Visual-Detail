# Design: Admin Dashboard y Gestión de Pedidos

## Technical Approach

Implementar un sistema de panel de administración completo con backend y frontend paralelos. El backend expone endpoints REST para estadísticas y gestión de pedidos con verificación de rol admin. El frontend implementa Dashboard con KPI cards y Orders con filtros y cambio de estado.

## Architecture Decisions

### Decision: Backend API Structure

**Choice**: Create `src/routes/admin.routes.js` as dedicated admin router
**Alternatives considered**: Extend existing pedidos.routes.js
**Rationale**: Separation of concerns - admin endpoints have distinct auth requirements and different data aggregation needs. Easier to maintain and secure.

### Decision: Frontend Page Structure

**Choice**: Create new pages under `src/pages/admin/` following existing pattern
**Alternatives considered**: Reuse existing admin layout wrapper
**Rationale**: Follow existing project conventions (Products, Users are in src/pages/admin/). Create shared KPI Card component.

### Decision: State Management

**Choice**: Use existing pattern (axios + local component state)
**Alternatives considered**: Add React Query or SWR
**Rationale**: Existing project uses direct axios calls. Keep consistency - can refactor later if needed.

### Decision: Admin Middleware

**Choice**: Add isAdmin check to existing auth middleware
**Alternatives considered**: Create separate adminAuth middleware
**Rationale**: Existing auth middleware already handles JWT verification. Add role check in same middleware for simplicity.

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│ Frontend (React)                                            │
├─────────────────────────────────────────────────────────────┤
│ Dashboard ──fetch──> /api/admin/estadisticas                │
│ Orders    ──fetch──> /api/admin/pedidos?estado=X&page=Y    │
│ Status    ──PUT───> /api/admin/pedidos/:id/estado          │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ Backend (Node/Express)                                     │
├─────────────────────────────────────────────────────────────┤
│ authMiddleware.verifyToken ──> adminMiddleware.requireAdmin │
│ adminRoutes.get('/estadisticas') ──> service.aggregate()  │
│ adminRoutes.get('/pedidos')     ──> service.findAll()     │
│ adminRoutes.put('/pedidos/:id') ──> service.updateStatus()│
└─────────────────────────────────────────────────────────────┘
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/pages/admin/Dashboard/index.jsx` | Create | Dashboard con KPI cards y pedidos recientes |
| `src/pages/admin/Orders/index.jsx` | Create | Lista de pedidos con filtros y paginación |
| `src/components/common/KPICard.jsx` | Create | Componente reutilizable para métricas |
| `src/api/adminApi.js` | Create | Servicios API para endpoints admin |
| `src/components/layout/Header.jsx` | Modify | Agregar dropdown menu para admin |
| `src/App.jsx` | Modify | Agregar rutas `/adm` y `/adm/pedidos` |
| `server/routes/admin.routes.js` | Create | Router para endpoints admin |
| `server/middleware/admin.middleware.js` | Create | Middleware de verificación de rol admin |
| `server/controllers/admin.controller.js` | Create | Controladores para admin |
| `server/services/admin.service.js` | Create | Métodos de agregación y consultas |

## Interfaces / Contracts

### Backend: GET /api/admin/estadisticas

```javascript
// Response
{
  pedidos: {
    pendientes: number,
    completados: number,
    cancelados: number,
    total: number
  },
  ventas: {
    total: number,
    mes: number
  },
  stock: {
    productosSinStock: number
  },
  usuarios: {
    total: number
  }
}
```

### Backend: GET /api/admin/pedidos

```javascript
// Query params: ?page=1&limit=10&estado=Pendiente
// Response
{
  pedidos: [
    {
      _id: string,
      numeroPedido: string,
      usuario: { _id, nombre, email },
      productos: [{ producto, cantidad, precio }],
      estado: "Pendiente" | "Completado" | "Cancelado",
      createdAt: string,
      total: number
    }
  ],
  total: number,
  page: number,
  totalPages: number
}
```

### Backend: PUT /api/admin/pedidos/:id/estado

```javascript
// Body: { estado: "Completado" }
// Response: { pedido: { ...updated } }
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | KPI Card rendering, Filter tabs logic | Vitest/Shallow render |
| Integration | API endpoint responses, auth middleware | Manual cURL or Postman |
| E2E | Dashboard load, order status change | Playwright |

## Migration / Rollout

No migration required. New functionality only.

## Open Questions

- [ ] Confirm backend base URL in production (currently hardcoded as `https://visual-detail-backend.onrender.com`)
- [ ] Decide if pagination uses cursor or offset-based (offset simpler for this scale)
- [ ] Consider if stats should be cached (not needed initially - scale is small)