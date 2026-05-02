# Documento de Requisitos

## Introducción

Este documento define los requisitos funcionales para implementar el modelo de negocio completo de inventario en el microservicio `ms-inventory` del proyecto `engine-render`. El sistema debe gestionar productos, niveles de stock, movimientos, proveedores y almacenes bajo un modelo multi-tenant, siguiendo el patrón arquitectónico `Controller → Facade → Specialized Services → Repository` del monorepo. El motor genérico de persistencia (`saveInventory`/`getInventory`) debe coexistir sin modificaciones.

---

## Glosario

- **Product**: Artículo que puede ser almacenado, vendido o comprado. Identificado de forma única por `sku` dentro de un tenant.
- **StockLevel**: Proyección optimizada de la cantidad disponible de un `Product` en un `Warehouse` específico.
- **StockMovement**: Registro inmutable de cada cambio en el stock. Es la fuente de verdad del inventario (event sourcing light).
- **Supplier**: Entidad que suministra productos al tenant.
- **Warehouse**: Ubicación física donde se almacenan productos, perteneciente a un tenant.
- **customerId**: Identificador del tenant, extraído exclusivamente del JWT. Nunca proviene del body del request.
- **userId**: Identificador del usuario que realiza la operación, extraído del JWT.
- **SKU**: Stock Keeping Unit. Código alfanumérico único que identifica un producto dentro de un tenant.
- **availableQuantity**: Cantidad calculada como `quantity - reservedQuantity`. Representa el stock real disponible para nuevas operaciones.
- **reservedQuantity**: Cantidad de stock bloqueada por pedidos pendientes de confirmación.
- **AuthGuard**: Guard de NestJS que valida el JWT y adjunta el payload del usuario al request.
- **Inventory_Controller**: Controlador NestJS que expone los endpoints HTTP del dominio de inventario.
- **Product_Facade**: Servicio fachada que orquesta todas las operaciones del dominio `Product`.
- **Stock_Facade**: Servicio fachada que orquesta todas las operaciones del dominio `StockLevel` y `StockMovement`.
- **Supplier_Facade**: Servicio fachada que orquesta todas las operaciones del dominio `Supplier`.
- **Warehouse_Facade**: Servicio fachada que orquesta todas las operaciones del dominio `Warehouse`.
- **Report_Facade**: Servicio fachada que orquesta la generación de reportes de inventario.
- **Product_Validation_Service**: Servicio especializado que valida reglas de negocio de productos (SKU único, precios).
- **Stock_Validation_Service**: Servicio especializado que valida reglas de negocio de stock (stock no negativo, disponibilidad).
- **Stock_Movement_Service**: Servicio especializado que crea y persiste registros de `StockMovement`.
- **Stock_Alert_Service**: Servicio especializado que detecta stock bajo mínimo y emite alertas a `ms-notifications`.
- **ms-notifications**: Microservicio externo en el puerto 4003 que gestiona alertas y notificaciones push.
- **ms-users**: Microservicio externo en el puerto 4001 que gestiona autenticación y validación JWT.
- **Soft Delete**: Estrategia de eliminación lógica que marca un registro como inactivo (`isActive: false`) sin eliminarlo físicamente de la base de datos.
- **ENTRY**: Tipo de movimiento que incrementa el stock (entrada de mercancía).
- **EXIT**: Tipo de movimiento que decrementa el stock (salida de mercancía).
- **ADJUSTMENT**: Tipo de movimiento que corrige el stock a un valor absoluto (ajuste de inventario).
- **TRANSFER**: Tipo de movimiento que mueve stock de un `Warehouse` a otro dentro del mismo tenant.

---

## Requisitos

### Requisito 1: Gestión de Productos (CRUD)

**User Story:** Como administrador de inventario, quiero crear, consultar, actualizar y desactivar productos, para mantener el catálogo de artículos del negocio actualizado y organizado.

#### Criterios de Aceptación

1. WHEN un request autenticado con datos válidos de producto es recibido en `POST /api/v1/inventory/products`, THE `Product_Facade` SHALL crear el producto y retornar el documento creado con su `_id` generado.
2. WHEN un request de creación de producto es recibido, THE `Product_Validation_Service` SHALL verificar que el `sku` no exista previamente para el mismo `customerId` antes de persistir.
3. IF el `sku` ya existe para el `customerId` del JWT al crear o actualizar un producto, THEN THE `Product_Facade` SHALL retornar un error HTTP 409 con el mensaje `"SKU ya registrado para este tenant"`.
4. WHEN un request autenticado es recibido en `GET /api/v1/inventory/products`, THE `Product_Facade` SHALL retornar únicamente los productos cuyo `customerId` coincida con el del JWT, con soporte de paginación mediante parámetros `page` y `limit`.
5. WHERE el parámetro de query `category` es proporcionado, THE `Product_Facade` SHALL filtrar los productos retornados por la categoría especificada.
6. WHERE el parámetro de query `isActive` es proporcionado, THE `Product_Facade` SHALL filtrar los productos retornados por su estado activo o inactivo.
7. WHERE el parámetro de query `search` es proporcionado, THE `Product_Facade` SHALL retornar productos cuyo `name` o `sku` contengan el término de búsqueda (búsqueda insensible a mayúsculas).
8. WHEN un request autenticado es recibido en `GET /api/v1/inventory/products/:id`, THE `Product_Facade` SHALL retornar el producto correspondiente al `id` solo si su `customerId` coincide con el del JWT.
9. IF el producto solicitado por `id` no existe o su `customerId` no coincide con el del JWT, THEN THE `Product_Facade` SHALL retornar un error HTTP 404 con el mensaje `"Producto no encontrado"`.
10. WHEN un request autenticado con datos válidos es recibido en `PUT /api/v1/inventory/products/:id`, THE `Product_Facade` SHALL actualizar los campos proporcionados del producto y retornar el documento actualizado.
11. WHEN un request autenticado es recibido en `DELETE /api/v1/inventory/products/:id`, THE `Product_Facade` SHALL establecer `isActive: false` en el producto (soft delete) sin eliminar el documento de la base de datos.
12. WHEN un producto es creado, THE `Product_Validation_Service` SHALL emitir un warning en el log si `salePrice` es menor que `costPrice`, sin bloquear la operación.
13. THE `Inventory_Controller` SHALL extraer el `customerId` exclusivamente del payload del JWT en todos los endpoints de productos, ignorando cualquier `customerId` presente en el body del request.

---

### Requisito 2: Gestión de Proveedores (CRUD)

**User Story:** Como administrador de inventario, quiero gestionar proveedores, para vincularlos a los productos y tener trazabilidad de las fuentes de suministro.

#### Criterios de Aceptación

1. WHEN un request autenticado con datos válidos es recibido en `POST /api/v1/inventory/suppliers`, THE `Supplier_Facade` SHALL crear el proveedor y retornar el documento creado con su `_id`.
2. WHEN un request autenticado es recibido en `GET /api/v1/inventory/suppliers`, THE `Supplier_Facade` SHALL retornar únicamente los proveedores cuyo `customerId` coincida con el del JWT.
3. WHEN un request autenticado con datos válidos es recibido en `PUT /api/v1/inventory/suppliers/:id`, THE `Supplier_Facade` SHALL actualizar los campos proporcionados del proveedor y retornar el documento actualizado.
4. IF el proveedor solicitado por `id` no existe o su `customerId` no coincide con el del JWT, THEN THE `Supplier_Facade` SHALL retornar un error HTTP 404 con el mensaje `"Proveedor no encontrado"`.
5. THE `Inventory_Controller` SHALL extraer el `customerId` exclusivamente del payload del JWT en todos los endpoints de proveedores.

---

### Requisito 3: Gestión de Almacenes (CRUD)

**User Story:** Como administrador de inventario, quiero gestionar almacenes, para organizar el stock por ubicaciones físicas dentro del negocio.

#### Criterios de Aceptación

1. WHEN un request autenticado con datos válidos es recibido en `POST /api/v1/inventory/warehouses`, THE `Warehouse_Facade` SHALL crear el almacén y retornar el documento creado con su `_id`.
2. WHEN un request autenticado es recibido en `GET /api/v1/inventory/warehouses`, THE `Warehouse_Facade` SHALL retornar únicamente los almacenes cuyo `customerId` coincida con el del JWT.
3. IF el almacén solicitado por `id` no existe o su `customerId` no coincide con el del JWT, THEN THE `Warehouse_Facade` SHALL retornar un error HTTP 404 con el mensaje `"Almacén no encontrado"`.
4. THE `Inventory_Controller` SHALL extraer el `customerId` exclusivamente del payload del JWT en todos los endpoints de almacenes.

---

### Requisito 4: Operaciones de Stock — Entrada

**User Story:** Como operador de almacén, quiero registrar entradas de mercancía, para incrementar el stock disponible de un producto en un almacén específico.

#### Criterios de Aceptación

1. WHEN un request autenticado con `productId`, `warehouseId`, `quantity` y `reason` válidos es recibido en `POST /api/v1/inventory/stock/entry`, THE `Stock_Facade` SHALL incrementar el `quantity` del `StockLevel` correspondiente en la cantidad indicada.
2. WHEN una entrada de stock es procesada exitosamente, THE `Stock_Movement_Service` SHALL crear un registro `StockMovement` de tipo `ENTRY` con los campos `previousStock`, `newStock`, `userId`, `customerId`, `productId`, `warehouseId`, `quantity`, `reason` y `createdAt`.
3. IF el `productId` o `warehouseId` proporcionados no existen para el `customerId` del JWT, THEN THE `Stock_Facade` SHALL retornar un error HTTP 404 con el mensaje correspondiente antes de modificar el stock.
4. WHILE el `StockLevel` para la combinación `productId`/`warehouseId` no existe, THE `Stock_Facade` SHALL crear un nuevo registro `StockLevel` con `quantity` igual al valor de la entrada y `reservedQuantity` igual a cero.
5. THE `Stock_Movement_Service` SHALL persistir el `StockMovement` de forma atómica junto con la actualización del `StockLevel`, garantizando que ambas operaciones se completen o ninguna se persista.

---

### Requisito 5: Operaciones de Stock — Salida

**User Story:** Como operador de almacén, quiero registrar salidas de mercancía, para decrementar el stock disponible y mantener el inventario actualizado.

#### Criterios de Aceptación

1. WHEN un request autenticado con `productId`, `warehouseId`, `quantity` y `reason` válidos es recibido en `POST /api/v1/inventory/stock/exit`, THE `Stock_Validation_Service` SHALL verificar que `availableQuantity >= quantity` antes de procesar la salida.
2. IF `availableQuantity` es menor que `quantity` solicitada en una operación de salida, THEN THE `Stock_Facade` SHALL retornar un error HTTP 400 con el mensaje `"Stock insuficiente. Disponible: {availableQuantity}, solicitado: {quantity}"` sin modificar el stock.
3. WHEN la validación de stock disponible es exitosa, THE `Stock_Facade` SHALL decrementar el `quantity` del `StockLevel` en la cantidad indicada.
4. WHEN una salida de stock es procesada exitosamente, THE `Stock_Movement_Service` SHALL crear un registro `StockMovement` de tipo `EXIT` con los campos `previousStock`, `newStock`, `userId`, `customerId`, `productId`, `warehouseId`, `quantity`, `reason` y `createdAt`.
5. WHEN una salida de stock es procesada exitosamente, THE `Stock_Alert_Service` SHALL verificar si el `newStock` del `StockLevel` es menor o igual al `minStock` del producto asociado.
6. WHEN el `newStock` es menor o igual al `minStock` del producto, THE `Stock_Alert_Service` SHALL enviar una notificación HTTP POST al endpoint de `ms-notifications` (puerto 4003) con el `productId`, `customerId`, `userId`, `warehouseId` y el stock actual.
7. IF la llamada a `ms-notifications` falla, THEN THE `Stock_Alert_Service` SHALL registrar el error en el log sin interrumpir ni revertir la operación de salida de stock.

---

### Requisito 6: Operaciones de Stock — Ajuste

**User Story:** Como administrador de inventario, quiero realizar ajustes de inventario, para corregir discrepancias entre el stock físico y el registrado en el sistema.

#### Criterios de Aceptación

1. WHEN un request autenticado con `productId`, `warehouseId`, `newQuantity` y `reason` válidos es recibido en `POST /api/v1/inventory/stock/adjustment`, THE `Stock_Facade` SHALL establecer el `quantity` del `StockLevel` al valor absoluto de `newQuantity`.
2. IF `newQuantity` es un número negativo en una operación de ajuste, THEN THE `Stock_Facade` SHALL retornar un error HTTP 400 con el mensaje `"La cantidad ajustada no puede ser negativa"`.
3. WHEN un ajuste de stock es procesado exitosamente, THE `Stock_Movement_Service` SHALL crear un registro `StockMovement` de tipo `ADJUSTMENT` con los campos `previousStock`, `newStock`, `userId`, `customerId`, `productId`, `warehouseId`, `quantity` (diferencia absoluta) y `reason`.
4. WHEN un ajuste resulta en un `newStock` menor o igual al `minStock` del producto, THE `Stock_Alert_Service` SHALL enviar la notificación de stock mínimo a `ms-notifications` siguiendo las mismas reglas del Requisito 5.

---

### Requisito 7: Operaciones de Stock — Transferencia entre Almacenes

**User Story:** Como operador de almacén, quiero transferir stock entre almacenes, para redistribuir mercancía sin perder trazabilidad del movimiento.

#### Criterios de Aceptación

1. WHEN un request autenticado con `productId`, `sourceWarehouseId`, `targetWarehouseId`, `quantity` y `reason` válidos es recibido en `POST /api/v1/inventory/stock/transfer`, THE `Stock_Validation_Service` SHALL verificar que el `availableQuantity` del almacén origen sea mayor o igual a `quantity`.
2. IF el `availableQuantity` del almacén origen es menor que `quantity` en una transferencia, THEN THE `Stock_Facade` SHALL retornar un error HTTP 400 con el mensaje `"Stock insuficiente en almacén origen. Disponible: {availableQuantity}, solicitado: {quantity}"`.
3. IF `sourceWarehouseId` es igual a `targetWarehouseId`, THEN THE `Stock_Facade` SHALL retornar un error HTTP 400 con el mensaje `"El almacén origen y destino no pueden ser el mismo"`.
4. WHEN la validación es exitosa, THE `Stock_Facade` SHALL decrementar el `quantity` del `StockLevel` del almacén origen e incrementar el `quantity` del `StockLevel` del almacén destino en la misma cantidad, de forma atómica.
5. WHEN una transferencia es procesada exitosamente, THE `Stock_Movement_Service` SHALL crear un único registro `StockMovement` de tipo `TRANSFER` con los campos `productId`, `warehouseId` (origen), `targetWarehouseId` (destino), `quantity`, `previousStock`, `newStock`, `userId`, `customerId`, `reason` y `createdAt`.

---

### Requisito 8: Reserva de Stock para Pedidos

**User Story:** Como sistema de pedidos, quiero reservar y liberar stock, para garantizar que la mercancía comprometida en pedidos pendientes no sea asignada a otras operaciones.

#### Criterios de Aceptación

1. WHEN un request autenticado con `productId`, `warehouseId` y `quantity` válidos es recibido en `POST /api/v1/inventory/stock/reserve`, THE `Stock_Validation_Service` SHALL verificar que `availableQuantity >= quantity` antes de crear la reserva.
2. IF `availableQuantity` es menor que `quantity` al intentar reservar, THEN THE `Stock_Facade` SHALL retornar un error HTTP 400 con el mensaje `"Stock disponible insuficiente para reservar. Disponible: {availableQuantity}, solicitado: {quantity}"`.
3. WHEN la validación de reserva es exitosa, THE `Stock_Facade` SHALL incrementar el `reservedQuantity` del `StockLevel` en la cantidad indicada.
4. WHEN un request autenticado con `productId`, `warehouseId` y `quantity` válidos es recibido en `POST /api/v1/inventory/stock/release`, THE `Stock_Facade` SHALL decrementar el `reservedQuantity` del `StockLevel` en la cantidad indicada.
5. IF el `reservedQuantity` resultante de una liberación sería negativo, THEN THE `Stock_Facade` SHALL establecer `reservedQuantity` en cero en lugar de un valor negativo.
6. WHILE el `StockLevel` existe, THE `Stock_Facade` SHALL calcular y retornar `availableQuantity` como `quantity - reservedQuantity` en todas las respuestas de consulta de stock.

---

### Requisito 9: Consulta de Niveles de Stock

**User Story:** Como administrador de inventario, quiero consultar los niveles de stock actuales, para tomar decisiones de compra y distribución informadas.

#### Criterios de Aceptación

1. WHEN un request autenticado es recibido en `GET /api/v1/inventory/stock`, THE `Stock_Facade` SHALL retornar todos los registros `StockLevel` cuyo `customerId` coincida con el del JWT, con soporte de paginación.
2. WHERE el parámetro de query `warehouseId` es proporcionado, THE `Stock_Facade` SHALL filtrar los niveles de stock retornados por el almacén especificado.
3. WHERE el parámetro de query `lowStock` con valor `true` es proporcionado, THE `Stock_Facade` SHALL retornar únicamente los registros `StockLevel` donde `quantity` sea menor o igual al `minStock` del producto asociado.
4. WHEN un request autenticado es recibido en `GET /api/v1/inventory/stock/:productId`, THE `Stock_Facade` SHALL retornar todos los registros `StockLevel` del producto especificado en todos los almacenes del tenant.
5. THE `Stock_Facade` SHALL incluir en cada registro de respuesta los campos `quantity`, `reservedQuantity` y `availableQuantity` calculado.

---

### Requisito 10: Historial de Movimientos de Stock

**User Story:** Como auditor de inventario, quiero consultar el historial completo de movimientos, para tener trazabilidad total de todos los cambios en el inventario.

#### Criterios de Aceptación

1. WHEN un request autenticado es recibido en `GET /api/v1/inventory/movements`, THE `Stock_Facade` SHALL retornar los registros `StockMovement` cuyo `customerId` coincida con el del JWT, ordenados por `createdAt` descendente, con soporte de paginación.
2. WHERE los parámetros de query `startDate` y `endDate` son proporcionados, THE `Stock_Facade` SHALL filtrar los movimientos retornados al rango de fechas especificado (inclusive en ambos extremos).
3. WHERE el parámetro de query `type` es proporcionado, THE `Stock_Facade` SHALL filtrar los movimientos por el tipo de operación (`ENTRY`, `EXIT`, `ADJUSTMENT`, `TRANSFER`).
4. WHEN un request autenticado es recibido en `GET /api/v1/inventory/movements/:productId`, THE `Stock_Facade` SHALL retornar todos los movimientos del producto especificado para el tenant del JWT, ordenados por `createdAt` descendente.
5. THE `Stock_Movement_Service` SHALL garantizar que ningún registro `StockMovement` sea modificado o eliminado una vez creado (inmutabilidad).

---

### Requisito 11: Reporte de Valorización del Inventario

**User Story:** Como gerente de negocio, quiero obtener el valor total del inventario, para conocer el capital invertido en mercancía.

#### Criterios de Aceptación

1. WHEN un request autenticado es recibido en `GET /api/v1/inventory/reports/valuation`, THE `Report_Facade` SHALL calcular y retornar el valor total del inventario del tenant como la suma de `(quantity * costPrice)` para cada `StockLevel` activo.
2. THE `Report_Facade` SHALL incluir en la respuesta de valorización el desglose por producto con los campos `productId`, `sku`, `name`, `quantity`, `costPrice` y `totalValue` calculado.
3. WHERE el parámetro de query `warehouseId` es proporcionado en el reporte de valorización, THE `Report_Facade` SHALL calcular la valorización únicamente para los `StockLevel` del almacén especificado.
4. THE `Report_Facade` SHALL incluir en la respuesta el `grandTotal` como suma de todos los `totalValue` individuales.

---

### Requisito 12: Reporte de Productos Bajo Stock Mínimo

**User Story:** Como administrador de inventario, quiero obtener un listado de productos bajo stock mínimo, para priorizar las órdenes de reabastecimiento.

#### Criterios de Aceptación

1. WHEN un request autenticado es recibido en `GET /api/v1/inventory/reports/low-stock`, THE `Report_Facade` SHALL retornar todos los registros `StockLevel` donde `quantity <= product.minStock` para el tenant del JWT.
2. THE `Report_Facade` SHALL incluir en cada registro del reporte los campos `productId`, `sku`, `name`, `currentStock`, `minStock`, `warehouseId` y `warehouseName`.
3. THE `Report_Facade` SHALL ordenar los resultados del reporte de bajo stock por la diferencia `(minStock - currentStock)` de mayor a menor (los más críticos primero).

---

### Requisito 13: Reporte de Resumen de Movimientos por Período

**User Story:** Como gerente de negocio, quiero obtener un resumen de entradas y salidas por período, para analizar la rotación del inventario.

#### Criterios de Aceptación

1. WHEN un request autenticado con parámetros `startDate` y `endDate` es recibido en `GET /api/v1/inventory/reports/movements-summary`, THE `Report_Facade` SHALL retornar el resumen de movimientos del tenant en el período especificado.
2. THE `Report_Facade` SHALL incluir en el resumen el total de unidades de tipo `ENTRY`, el total de unidades de tipo `EXIT`, el total de unidades de tipo `ADJUSTMENT` y el total de unidades de tipo `TRANSFER` dentro del período.
3. IF los parámetros `startDate` o `endDate` no son fechas válidas, THEN THE `Report_Facade` SHALL retornar un error HTTP 400 con el mensaje `"Formato de fecha inválido. Use ISO 8601 (YYYY-MM-DD)"`.
4. WHERE el parámetro de query `productId` es proporcionado en el resumen de movimientos, THE `Report_Facade` SHALL filtrar el resumen al producto especificado.

---

### Requisito 14: Seguridad y Multi-tenancy

**User Story:** Como arquitecto del sistema, quiero que todos los endpoints estén protegidos y los datos aislados por tenant, para garantizar la seguridad y privacidad de los datos de cada cliente.

#### Criterios de Aceptación

1. THE `Inventory_Controller` SHALL aplicar el `AuthGuard` JWT a todos los endpoints del dominio de inventario, retornando HTTP 401 para requests sin token o con token inválido.
2. THE `Inventory_Controller` SHALL extraer el `customerId` y el `userId` exclusivamente del payload del JWT verificado, sin aceptar estos valores desde el body o query params del request.
3. WHEN cualquier operación de lectura o escritura es ejecutada, THE `Product_Facade` SHALL filtrar todas las consultas a MongoDB incluyendo el `customerId` del JWT como condición obligatoria.
4. WHEN cualquier operación de lectura o escritura es ejecutada, THE `Stock_Facade` SHALL filtrar todas las consultas a MongoDB incluyendo el `customerId` del JWT como condición obligatoria.
5. WHEN cualquier operación de lectura o escritura es ejecutada, THE `Supplier_Facade` SHALL filtrar todas las consultas a MongoDB incluyendo el `customerId` del JWT como condición obligatoria.
6. WHEN cualquier operación de lectura o escritura es ejecutada, THE `Warehouse_Facade` SHALL filtrar todas las consultas a MongoDB incluyendo el `customerId` del JWT como condición obligatoria.
7. IF un request intenta acceder a un recurso cuyo `customerId` no coincide con el del JWT, THEN THE `Inventory_Controller` SHALL retornar HTTP 404 (no HTTP 403) para no revelar la existencia del recurso.

---

### Requisito 15: Coexistencia con el Motor Genérico de Persistencia

**User Story:** Como desarrollador del sistema, quiero que el nuevo modelo de negocio coexista con el motor genérico existente, para no romper las integraciones actuales del frontend dinámico.

#### Criterios de Aceptación

1. THE `Inventory_Controller` SHALL mantener los endpoints `POST /inventory` y `GET /inventory` del motor genérico (`saveInventory`/`getInventory`) sin modificaciones funcionales.
2. WHEN el nuevo módulo de negocio es inicializado, THE `InventoryModule` SHALL registrar tanto el `InventoryService` genérico existente como los nuevos facades de negocio sin conflictos de inyección de dependencias.
3. THE `InventoryModule` SHALL utilizar colecciones MongoDB separadas para el modelo de negocio (`products`, `stock_levels`, `stock_movements`, `suppliers`, `warehouses`) sin interferir con las colecciones dinámicas del motor genérico.
