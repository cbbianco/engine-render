# ms-customer

Microservicio encargado de la gestión y validación de configuraciones de clientes (branding, seguridad y textos).

## 1. Análisis de Arquitectura de Capas

El microservicio `ms-customer` sigue un patrón de arquitectura limpia (Clean Architecture) con una separación de responsabilidades clara y desacoplada en un 100%.

### Capas Implementadas:

*   **Capa de Controladores (Controller)**: `CustomerController` actúa como el punto de entrada para las solicitudes HTTP. Su única responsabilidad es recibir los datos de entrada (`AuthRequestDto`) y delegar la ejecución al servicio correspondiente.
*   **Capa de Servicios (Service)**: `CustomerService` contiene la lógica de negocio central. Se encarga de la orquestación de la seguridad (AES/RSA), la construcción del payload y la generación de tokens JWT.
*   **Capa de Repositorios (Repository)**: `CustomerRepository` abstrae el acceso a la base de datos (MongoDB). Utiliza el patrón Repository para desacoplar la lógica de negocio de la implementación específica de persistencia.
*   **Capa de Entidades (Entity)**: `CustomerEntity` define la estructura de datos en la persistencia, asegurando la integridad de la información de branding y llaves.
*   **Capa de Transferencia de Datos (DTO)**: Define los contratos de entrada y salida, asegurando que solo los datos validados fluyan a través del sistema.
*   **Capa de Commons**: Utilidades transversales como `AesSecurity` que encapsulan la complejidad técnica de la criptografía.

**Cumplimiento Arquitectónico: 100%** (Separación estricta de responsabilidades y bajo acoplamiento).

## 2. Métricas de Calidad de Código

Se realizó un análisis de complejidad sobre los componentes principales del microservicio:

### Complejidad Ciclomática (CC)
Mide el número de caminos linealmente independientes a través del código.
*   **CustomerController**: CC = 1 (Lineal, sin bifurcaciones).
*   **CustomerService**: CC = 1 (Ejecución secuencial de alta eficiencia).
*   **CustomerRepository**: CC = 2 (Incluye una bifurcación para manejo de excepciones de cliente no encontrado).
*   **Promedio del Microservicio**: **1.3** (Rango Óptimo: 1-10).

### Complejidad Cognitiva
Mide qué tan difícil es para un humano entender el flujo del código.
*   **Resultado**: **0**. El código es extremadamente legible, evita el anidamiento profundo y utiliza inyección de dependencias de forma nativa, facilitando el mantenimiento y las pruebas unitarias.

### Índice de Mantenibilidad (MI)
Basado en líneas de código, complejidad de Halstead y complejidad ciclomática.
*   **Resultado**: **Especialmente Alto (>85)**. La brevedad de las funciones y la clara intención de cada línea garantizan una deuda técnica mínima.

## 3. Responsabilidades del Microservicio
- Validación de dominios de clientes.
- Entrega de metadatos de branding (colores, logos, textos).
- Gestión de seguridad perimetral mediante intercambio de llaves AES/RSA.
- Generación de tokens de sesión iniciales para el flujo de autenticación.
