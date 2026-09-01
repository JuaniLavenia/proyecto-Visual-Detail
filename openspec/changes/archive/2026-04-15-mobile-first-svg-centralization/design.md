# Design: Mobile-First Responsive + SVGs Centralization

## Technical Approach

Implementar un sistema de icons centralizado en `src/components/common/Icons/` y crear un componente `AdminActionsMenu` que agrupe los 4 botones del header de admin con comportamiento responsive. La estrategia mobile-first sigue la Opción A (menú colapsable) por mejor UX según specs.

## Architecture Decisions

### Decision: Estructura de carpeta para Icons centralizados

**Choice**: `src/components/common/Icons/` con un archivo por icono
**Alternatives considered**: 
- Un solo archivo con todos los icons (viola SRP)
- Usar librería externa como iconoir (no instalada actualmente)
- Componente único con prop "name" (less type-safe)
**Rationale**: Cada SVG definido una sola vez, easy maintenance, mejor tree-shaking

### Decision: Mobile-first strategy para admin Products

**Choice**: Opción A - Menú colapsable (AdminActionsMenu)
**Alternatives considered**: 
- Opción B: iconos solos en mobile (menos claro para usuarios)
- No hacer nada (problema actual)
**Rationale**: UX más clara - usuario ve "Más" y dropdown con todos los actions disponibles

### Decision: Breakpoints para AdminActionsMenu

**Choice**: 3 breakpoints (≥1024px / 768-1023px / <768px)
**Alternatives considered**: 
- 2 breakpoints (mobile/desktop only)
- 4 breakpoints (incluyendo small mobile)
**Rationale**: El proyecto ya usa Tailwind breakpoints estándar, mantener consistencia

## Data Flow

```
AdminActionsMenu
├── Desktop (≥1024px): Renderiza 4 botones directamente
├── Tablet (768-1023px): 2 botones + "More" dropdown
└── Mobile (<768px): Solo "More" dropdown

Dropdown items utilizan icons centralizados:
├── Export → IconExport
├── Import → IconImport
├── Nuevo → IconPlus
└── Usuarios → IconUsers
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/components/common/Icons/index.jsx` | Create | Exporta todos los icons |
| `src/components/common/Icons/Search.jsx` | Create | Icon search centralizado |
| `src/components/common/Icons/Close.jsx` | Create | Icon close/X centralizado |
| `src/components/common/Icons/Export.jsx` | Create | Icon export centralizado |
| `src/components/common/Icons/Import.jsx` | Create | Icon import centralizado |
| `src/components/common/Icons/Plus.jsx` | Create | Icon plus (+) centralizado |
| `src/components/common/Icons/Edit.jsx` | Create | Icon edit/lápiz centralizado |
| `src/components/common/Icons/Delete.jsx` | Create | Icon delete/basura centralizado |
| `src/components/common/Icons/Users.jsx` | Create | Icon users centralizado |
| `src/components/common/Icons/ChevronLeft.jsx` | Create | Icon chevron left |
| `src/components/common/Icons/ChevronRight.jsx` | Create | Icon chevron right |
| `src/components/common/AdminActionsMenu.jsx` | Create | Menú colapsable responsive |
| `src/pages/admin/Products/index.jsx` | Modify | Usa AdminActionsMenu + Icons centralizados |
| `src/components/layout/Header.jsx` | Modify | Usa Icons centralizados |
| `src/components/shared/Pagination.jsx` | Modify | Usa ChevronLeft/Right centralizados |

## Interfaces / Contracts

```jsx
// Icon base pattern
export default function IconName({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="..." />
    </svg>
  );
}

IconName.propTypes = {
  className: PropTypes.string,
};

// AdminActionsMenu props
AdminActionsMenu.propTypes = {
  onExport: PropTypes.func.isRequired,
  onImport: PropTypes.func.isRequired,
  onNew: PropTypes.func.isRequired,
  onUsers: PropTypes.func.isRequired,
  isExporting: PropTypes.bool,
};
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Cada Icon component props, render | Jest + React Testing Library |
| Integration | AdminActionsMenu responsive behavior | Tailwind breakpoints test |
| E2E | Navegación mobile admin Products | Playwright/Cypress |

## Migration / Rollout

1. Crear carpeta `Icons/` con todos los iconos
2. Crear `AdminActionsMenu` componente
3. Actualizar `Products/index.jsx` (reemplazar 4 botones por AdminActionsMenu)
4. Actualizar `Header.jsx` (reemplazar Icons inline por imports)
5. Actualizar `Pagination.jsx` (reemplazar SVGs por Chevron icons)
6. Verificar consistencia visual

No se requiere migración de datos. Feature flag no necesario - cambio backwards compatible.

## Open Questions

- [ ] ¿Mantener los icons del Header.jsx que tienenfill="white" hardcoded o hacerlos themeable?
- [ ] ¿El AdminActionsMenu dropdown debe cerrar al hacer click outside?