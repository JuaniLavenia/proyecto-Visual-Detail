# Specification: Admin Dashboard y Gestión de Pedidos

## Purpose

This specification defines the requirements for the admin dashboard and order management system, enabling administrators to monitor business metrics and manage orders through a centralized panel.

## Domain 1: admin-dashboard

### Requirement: Dashboard displays business metrics

The system SHALL display a dashboard page at `/adm` with KPI cards showing real-time business data.

#### Scenario: View dashboard with complete data

- GIVEN an authenticated user with admin role
- WHEN navigating to `/adm`
- THEN display 4 KPI cards with values from the API
- AND display a list of the 5 most recent orders
- AND display quick action buttons for "Ver Pedidos", "Gestionar Productos", "Gestionar Usuarios"

#### Scenario: View dashboard with no data

- GIVEN an admin user but no orders in the system
- WHEN navigating to `/adm`
- THEN display KPI cards with zero values
- AND display message "No hay pedidos recientes"

### Requirement: KPI cards display correct metrics

The system SHALL show four KPI cards with the following data: Pedidos Pendientes (count), Ventas del Mes (currency), Productos sin Stock (count), Total Usuarios (count).

#### Scenario: Display pending orders card

- GIVEN the statistics endpoint returns pendingOrders count
- WHEN rendering the dashboard
- THEN display yellow-themed card with "Pedidos Pendientes" label and the count value

#### Scenario: Display sales card

- GIVEN the statistics endpoint returns monthlySales value
- WHEN rendering the dashboard
- THEN display green-themed card with "Ventas del Mes" label and formatted currency

---

## Domain 2: admin-orders-list

### Requirement: Orders list displays with pagination

The system SHALL display a paginated table of all orders at `/adm/pedidos`.

#### Scenario: View all orders with pagination

- GIVEN there are more than 10 orders in the system
- WHEN visiting `/adm/pedidos`
- THEN display maximum 10 orders per page
- AND display pagination controls at the bottom
- AND show total page count

#### Scenario: Navigate to next page

- GIVEN viewing page 1 of orders
- WHEN clicking "next" pagination button
- THEN display orders 11-20
- AND update current page indicator

### Requirement: Filter orders by status

The system SHALL provide filter tabs to view orders by status: Todos, Pendientes, Completados, Cancelados.

#### Scenario: Filter by Pendiente status

- GIVEN user viewing the orders list
- WHEN clicking "Pendientes" tab
- THEN display only orders with estado = "Pendiente"
- AND highlight the active tab

#### Scenario: Filter by Completado status

- GIVEN user viewing the orders list
- WHEN clicking "Completados" tab
- THEN display only orders with estado = "Completado"
- AND highlight the active tab

#### Scenario: Filter by Cancelado status

- GIVEN user viewing the orders list
- WHEN clicking "Cancelados" tab
- THEN display only orders with estado = "Cancelado"
- AND highlight the active tab

### Requirement: Order status badges display correct colors

The system SHALL display status badges with appropriate colors for each order state.

#### Scenario: Display Pendiente badge

- GIVEN an order with estado = "Pendiente"
- WHEN rendering the status column
- THEN display badge with bg-yellow-500/20 and text-yellow-400

#### Scenario: Display Completado badge

- GIVEN an order with estado = "Completado"
- WHEN rendering the status column
- THEN display badge with bg-green-500/20 and text-green-400

#### Scenario: Display Cancelado badge

- GIVEN an order with estado = "Cancelado"
- WHEN rendering the status column
- THEN display badge with bg-red-500/20 and text-red-400

### Requirement: Change order status

The system SHALL allow admins to change order status via a dropdown menu.

#### Scenario: Update order to Completado

- GIVEN an admin viewing an order in "Pendiente" state
- WHEN selecting "Completado" from the status dropdown
- THEN send PUT request to `/api/admin/pedidos/:id/estado`
- AND update the order's status badge to green

#### Scenario: Update order to Cancelado

- GIVEN an admin viewing an order in "Pendiente" state
- WHEN selecting "Cancelado" from the status dropdown
- THEN send PUT request to `/api/admin/pedidos/:id/estado`
- AND update the order's status badge to red

---

## Domain 3: admin-header-menu

### Requirement: Admin dropdown menu in header

The system SHALL display an expandable dropdown menu in the Header component for authenticated admin users.

#### Scenario: Display admin dropdown

- GIVEN an authenticated user with admin role
- WHEN clicking "Admin" in the Header navigation
- THEN display dropdown menu with 4 options: Dashboard, Pedidos, Productos, Usuarios

#### Scenario: Navigate to Dashboard from dropdown

- GIVEN admin dropdown is open
- WHEN clicking "Dashboard" option
- THEN navigate to `/adm`
- AND close the dropdown

#### Scenario: Navigate to Pedidos from dropdown

- GIVEN admin dropdown is open
- WHEN clicking "Pedidos" option
- THEN navigate to `/adm/pedidos`
- AND close the dropdown

#### Scenario: Navigate to Productos from dropdown

- GIVEN admin dropdown is open
- WHEN clicking "Productos" option
- THEN navigate to `/adm/productos`
- AND close the dropdown

#### Scenario: Navigate to Usuarios from dropdown

- GIVEN admin dropdown is open
- WHEN clicking "Usuarios" option
- THEN navigate to `/adm/usuarios`
- AND close the dropdown

---

## Domain 4: backend-admin-api

### Requirement: Admin statistics endpoint

The system SHALL expose a GET endpoint at `/api/admin/estadisticas` that returns aggregated business metrics.

#### Scenario: Retrieve statistics successfully

- GIVEN an authenticated admin with valid token
- WHEN calling GET `/api/admin/estadisticas`
- THEN return JSON with structure:
  ```
  {
    pedidos: { pendientes: number, completados: number, cancelados: number, total: number },
    ventas: { total: number, hoy: number, semana: number, mes: number },
    stock: { productosSinStock: number, productosBajoStock: number, total: number }
  }
  ```

### Requirement: List all orders endpoint

The system SHALL expose a GET endpoint at `/api/admin/pedidos` with pagination and optional status filter.

#### Scenario: List all orders with pagination

- GIVEN an authenticated admin
- WHEN calling GET `/api/admin/pedidos?page=1&limit=10`
- THEN return JSON: `{ pedidos: [], total: number, page: number, totalPages: number }`
- AND each pedido includes usuario info and productos array

#### Scenario: Filter orders by status

- GIVEN an authenticated admin
- WHEN calling GET `/api/admin/pedidos?estado=Pendiente`
- THEN return only orders where estado = "Pendiente"

### Requirement: Get single order endpoint

The system SHALL expose a GET endpoint at `/api/admin/pedidos/:id` that returns complete order details.

#### Scenario: Retrieve single order

- GIVEN an authenticated admin
- WHEN calling GET `/api/admin/pedidos/:id`
- THEN return JSON:
  ```
  {
    pedido: {
      _id: string,
      numeroPedido: string,
      usuario: { _id: string, nombre: string, email: string },
      productos: [{ producto: {...}, cantidad: number, precio: number }],
      estado: string,
      createdAt: string,
      updatedAt: string
    }
  }
  ```

### Requirement: Update order status endpoint

The system SHALL expose a PUT endpoint at `/api/admin/pedidos/:id/estado` to change order status.

#### Scenario: Update order status

- GIVEN an authenticated admin
- WHEN calling PUT `/api/admin/pedidos/:id/estado` with body `{ estado: "Completado" }`
- THEN update the order's estado field
- AND return the updated order object

### Requirement: Admin role authorization

All admin endpoints SHALL verify the user has admin role before returning data.

#### Scenario: Unauthorized access returns 403

- GIVEN a non-admin authenticated user
- WHEN attempting to access any `/api/admin/*` endpoint
- THEN return 403 Forbidden error

---

## Component Specifications

### KPI Card Component

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| title | string | Yes | Card label text |
| value | number/string | Yes | Metric value to display |
| icon | ReactNode | Yes | Icon component |
| color | "green" \| "red" \| "yellow" \| "blue" | Yes | Theme color for card |

The component SHALL render with bg-gray-900 background, rounded-lg corners, p-4 padding, and hover:scale-105 transition effect.

### Order Table Component

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| pedidos | array | Yes | Array of order objects |
| onStatusChange | function | Yes | Callback when status changes |
| onView | function | Yes | Callback when viewing order details |

The component SHALL handle three states: loading skeleton, empty state with "No hay pedidos", and error state.

### Filter Tabs Component

The component SHALL render 4 tabs: Todos (default), Pendientes, Completados, Cancelados. Each tab filters the orders list accordingly.

---

## Acceptance Criteria

| ID | Criterion | Domain |
|----|-----------|--------|
| AC-1 | Dashboard shows 4 KPI cards with correct data from API | admin-dashboard |
| AC-2 | Dashboard shows last 5 orders with status badges | admin-dashboard |
| AC-3 | Quick action buttons navigate correctly | admin-dashboard |
| AC-4 | Dashboard only accessible to admin users | admin-dashboard |
| AC-5 | Orders page shows all orders with pagination | admin-orders-list |
| AC-6 | Filter tabs work correctly (filter by status) | admin-orders-list |
| AC-7 | Status badges show correct colors | admin-orders-list |
| AC-8 | Can change order status via dropdown | admin-orders-list |
| AC-9 | Orders page only accessible to admin users | admin-orders-list |
| AC-10 | Header admin dropdown works | admin-header-menu |
| AC-11 | All admin routes are protected (admin only) | admin-header-menu |
| AC-12 | Statistics endpoint returns correct aggregations | backend-admin-api |
| AC-13 | Order status updates correctly | backend-admin-api |
| AC-14 | All admin endpoints check admin role | backend-admin-api |

---

## Dependencies

- Requires existing Pedido model with `estado` field
- Requires existing Usuario model with role field
- Requires existing authentication middleware

## Out of Scope

- Advanced analytics or charts (future phase)
- Data export (CSV/PDF)
- Modifications to normal user purchase flow
