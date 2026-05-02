---
inclusion: fileMatch
fileMatchPattern: 'apps/ms-inventory/**'
---

# Dominio de Negocio: Inventario (ms-inventory)

## Contexto del Sistema
`ms-inventory` es el microservicio de gestión de inventario del CRM SolutionsNplusOne.
Corre en el puerto **4004**, usa **MongoDB** como base de datos principal y sigue el
patrón arquitectónico del monorepo: Controller → Facade → Specialized Services → Repository.

---

## Entidades del Dominio

### Producto (`Product`)
Representa un artículo que puede ser almacenado, vendido o comprado.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `sku` | string | Código único del producto (requerido) |
| `name` | string | Nombre del producto |
| `description` | string | Descripción detallada |
| `category` | string | Categoría (ej: "electrónica", "ropa") |
| `unit` | string | Unidad de medida (pza, kg, lt, caja) |
| `costPrice` | number | Precio de costo |
| `salePrice` | number | Precio de venta |
| `minStock` | number | Stock mínimo antes de alerta |
| `maxStock` | number | Stock máximo permitido |
| `supplierId` | string | Referencia al proveedor principal |
| `isActive` | boolean | Si el producto está activo |
| `customerId` | string | Tenant owner del producto |
| `createdAt` | Date | Fecha de creación |
| `updatedAt` | Date | Última modificación |

### Stock (`StockLevel`)
Representa la cantidad disponible de un producto en un almacén específico.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `productId` | string | Referencia al producto |
| `warehouseId` | string | Referencia al almacén |
| `customerId` | string | Tenant owner |
| `quantity` | number | Cantidad disponible (nunca negativa) |
| `reservedQuantity` | number | Cantidad reservada por pedidos pendientes |
| `availableQuantity` | number | quantity - reservedQuantity (calculado) |
| `lastUpdated` | Date | Última actualización |

### Movimiento de Stock (`StockMovement`)
Registro inmutable de cada cambio en el inventario. Es la fuente de verdad.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `type` | enum | `ENTRY` / `EXIT` / `ADJUSTMENT` / `TRANSFER` |
| `productId` | string | Producto afectado |
| `warehouseId` | string | Almacén origen |
| `targetWarehouseId` | string | Almacén destino (solo en TRANSFER) |
| `quantity` | number | Cantidad del movimiento (siempre positiva) |
| `previousStock` | number | Stock antes del movimiento |
| `newStock` | number | Stock después del movimiento |
| `reason` | string | Motivo del movimiento |
| `referenceId` | string | ID de orden de compra o venta relacionada |
| `userId` | string | Usuario que realizó el movimiento |
| `customerId` | string | Tenant owner |
| `createdAt` | Date | Timestamp del movimiento |

### Proveedor (`Supplier`)
Entidad que suministra productos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `name` | string | Nombre del proveedor |
| `contactEmail` | string | Email de contacto |
| `contactPhone` | string | Teléfono |
| `address` | string | Dirección |
| `customerId` | string | Tenant owner |
| `isActive` | boolean | Estado activo |

### Almacén (`Warehouse`)
Ubicación física donde se almacenan productos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `name` | string | Nombre del almacén |
| `location` | string | Dirección o descripción de ubicación |
| `customerId` | string | Tenant owner |
| `isActive` | boolean | Estado activo |

---

## Reglas de Negocio (CRÍTICAS)

### RN-01: Stock nunca negativo
- Una salida (`EXIT`) **no puede ejecutarse** si `availableQuantity < quantity`
- Lanzar `BadRequestException` con mensaje: `"Stock insuficiente. Disponible: X, solicitado: Y"`

### RN-02: Trazabilidad obligatoria
- Todo cambio de stock **debe** crear un `StockMovement`
- Los movimientos son **inmutables** — nunca se editan ni eliminan
- El stock actual se calcula desde los movimientos (event sourcing light)

### RN-03: Alerta de stock mínimo
- Después de cada `EXIT` o `ADJUSTMENT` negativo, verificar si `quantity <= product.minStock`
- Si se cumple, emitir evento de alerta (notificación al usuario via `ms-notifications`)

### RN-04: Reserva de stock
- Al crear un pedido pendiente, incrementar `reservedQuantity`
- `availableQuantity = quantity - reservedQuantity`
- Al confirmar o cancelar el pedido, liberar la reserva

### RN-05: Multi-tenant
- Todos los datos están aislados por `customerId`
- Nunca cruzar datos entre tenants
- El `customerId` siempre viene del JWT, nunca del body del request

### RN-06: SKU único por tenant
- El `sku` debe ser único dentro del mismo `customerId`
- Validar antes de crear o actualizar

### RN-07: Precio de costo vs venta
- `salePrice` debe ser >= `costPrice` (warning, no error bloqueante)
- El margen se calcula como: `((salePrice - costPrice) / costPrice) * 100`

---

## Endpoints Esperados

### Productos
- `POST   /api/v1/inventory/products` — Crear producto
- `GET    /api/v1/inventory/products` — Listar productos (con filtros: category, isActive, search)
- `GET    /api/v1/inventory/products/:id` — Obtener producto por ID
- `PUT    /api/v1/inventory/products/:id` — Actualizar producto
- `DELETE /api/v1/inventory/products/:id` — Desactivar producto (soft delete)

### Stock
- `GET    /api/v1/inventory/stock` — Ver stock actual (con filtros: warehouseId, lowStock)
- `GET    /api/v1/inventory/stock/:productId` — Stock de un producto específico
- `POST   /api/v1/inventory/stock/entry` — Registrar entrada de stock
- `POST   /api/v1/inventory/stock/exit` — Registrar salida de stock
- `POST   /api/v1/inventory/stock/adjustment` — Ajuste de inventario
- `POST   /api/v1/inventory/stock/transfer` — Transferencia entre almacenes

### Movimientos
- `GET    /api/v1/inventory/movements` — Historial de movimientos (paginado)
- `GET    /api/v1/inventory/movements/:productId` — Movimientos de un producto

### Proveedores
- `POST   /api/v1/inventory/suppliers` — Crear proveedor
- `GET    /api/v1/inventory/suppliers` — Listar proveedores
- `PUT    /api/v1/inventory/suppliers/:id` — Actualizar proveedor

### Almacenes
- `POST   /api/v1/inventory/warehouses` — Crear almacén
- `GET    /api/v1/inventory/warehouses` — Listar almacenes

### Reportes
- `GET    /api/v1/inventory/reports/valuation` — Valor total del inventario (qty * costPrice)
- `GET    /api/v1/inventory/reports/low-stock` — Productos bajo stock mínimo
- `GET    /api/v1/inventory/reports/movements-summary` — Resumen de entradas/salidas por período

---

## Arquitectura Interna (Patrón del Monorepo)

```
InventoryController
  └── ProductFacade
        ├── ProductValidationService  (SKU único, precios)
        ├── ProductPersistenceService (CRUD MongoDB)
        └── ProductRepository

  └── StockFacade
        ├── StockValidationService    (RN-01: stock no negativo)
        ├── StockMovementService      (RN-02: trazabilidad)
        ├── StockAlertService         (RN-03: alertas mínimo)
        └── StockRepository
```

---

## Integración con otros Microservicios

- **ms-notifications (4003)**: Enviar alerta cuando stock < mínimo (RN-03)
- **ms-users (4001)**: Validar JWT y obtener `userId` + `customerId` del token
- **ms-modules (4002)**: El motor de renderizado puede usar los endpoints para mostrar inventario en el CRM

---

## Notas de Implementación

- Usar **MongoDB** con colecciones separadas por entidad: `products`, `stock_levels`, `stock_movements`, `suppliers`, `warehouses`
- El `customerId` siempre se extrae del JWT (nunca del body)
- Todos los endpoints requieren `AuthGuard` de JWT
- Usar `class-validator` para DTOs
- Los movimientos de stock son la fuente de verdad — el `StockLevel` es una proyección optimizada
