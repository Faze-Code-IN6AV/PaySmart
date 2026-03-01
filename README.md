# PaySmart

Sistema de pagos basado en arquitectura de microservicios, desarrollado como parte del curso IN6AV - Kinal Guatemala 2026.

---

## Microservicios Implementados

- **AuthService**: Autenticación y gestión de usuarios.
- **AccountService**: Gestión de cuentas bancarias y saldo disponible.
- **TransactionService**: Gestión de transacciones y depósitos entre cuentas bancarias.
- **ProductService**: Gestión de productos disponibles para compra.
- **FavoriteAccountService**: Gestión de cuentas favoritas y transferencias rápidas.
- **ReportService**: Reportes administrativos de movimientos y cuentas.

---

## Base de Datos

- **PostgreSQL**: Para gestión de usuarios y roles (AuthService).
- **MongoDB**: Para los demás servicios. Cada servicio usa su propia base de datos.

| Servicio               | Base de Datos     |
|------------------------|-------------------|
| AccountService         | account-PS        |
| TransactionService     | transaction-PS    |
| ProductService         | product-PS        |
| FavoriteAccountService | favorite-PS       |

---

## Estado del Proyecto

- Todos los microservicios funcionales y probados.
- Registro, login, JWT, roles, verificación de email, recuperación de contraseña, creación de cuentas, transacciones, historial, productos, compras, cuentas favoritas y reportes implementados.
- Arquitectura basada en **Clean Architecture** (AuthService) y buenas prácticas de microservicios.

---

## Puertos por Servicio

| Servicio               | Puerto |
|------------------------|--------|
| AuthService            | 3000   |
| AccountService         | 3001   |
| TransactionService     | 3002   |
| ProductService         | 3003   |
| FavoriteAccountService | 3004   |
| ReportService          | 3005   |

---

## AuthService

Microservicio de autenticación y gestión de usuarios.

### Funcionalidades

- Registro de usuarios con verificación de email obligatoria.
- Login con email o username, solo permite acceso a cuentas verificadas.
- Reenvío de email de verificación.
- Recuperación y reset de contraseña por email con token expirable.
- Perfil de usuario autenticado.
- Sistema de roles y permisos (USER_ROLE, ADMIN_ROLE).
- Protecciones de seguridad: hashing con Argon2, JWT expirables, rate limiting, security headers.

### Tecnologías

- Backend: **ASP.NET Core 8.0**
- Base de Datos: **PostgreSQL** con EF Core 9.0
- Seguridad: JWT, Argon2, headers de seguridad (HSTS, XSS, etc.)
- Validación y logging: FluentValidation, Serilog
- Emails: SMTP (Gmail), plantillas HTML
- Documentación: Swagger/OpenAPI

### Configuración

Copia `appsettings.example.json` como `appsettings.json` y completa los valores:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=...;Database=...;Username=...;Password=...;Port=..."
  },
  "SmtpSettings": {
    "Username": "tu_correo@gmail.com",
    "Password": "tu_app_password",
    "FromEmail": "tu_correo@gmail.com"
  },
  "JwtSettings": {
    "SecretKey": "clave_secreta_minimo_32_caracteres"
  }
}
```

### Endpoints
**Base URL:** `http://localhost:3000/api/v1`

| Método | Ruta                        | Descripción                        | Authorization |
|--------|-----------------------------|------------------------------------|:-------------:|
| GET    | /health                     | Verificar salud del servidor       | No            |
| POST   | /auth/register              | Registrar nuevo usuario            | No            |
| POST   | /auth/verify-email          | Verificar email                    | No            |
| POST   | /auth/resend-verification   | Reenviar email de verificación     | No            |
| POST   | /auth/login                 | Iniciar sesión                     | No            |
| POST   | /auth/forgot-password       | Solicitar reset de contraseña      | No            |
| POST   | /auth/reset-password        | Confirmar reset de contraseña      | No            |
| GET    | /auth/profile               | Ver perfil del usuario autenticado | Sí            |
| POST   | /auth/profile/by-id         | Ver perfil por userId              | No            |
| PUT    | /users/{userId}/role        | Actualizar role de un usuario      | Sí (Admin)    |
| GET    | /users/{userId}/roles       | Ver roles de un usuario            | Sí (Admin)    |
| GET    | /users/by-role/{roleName}   | Ver usuarios por role              | Sí (Admin)    |

#### Registrar usuario — Form-Data
```json
{
  "name": "nombre",
  "surname": "apellido",
  "username": "usuario",
  "email": "correo@ejemplo.com",
  "password": "password",
  "phone": "12345678"
}
```

#### Login — JSON
```json
{
  "emailOrUsername": "usuario_o_correo",
  "password": "password"
}
```

---

## AccountService

Microservicio de gestión de cuentas bancarias.

### Funcionalidades

- Crear cuentas y asociarlas a un usuario autenticado (sin duplicados por tipo).
- Generar números de cuenta aleatorios de 18 dígitos.
- Consultar todas las cuentas de un usuario.
- Consultar saldo disponible de una cuenta específica.
- Validaciones de saldo mínimo según tipo de cuenta (Ahorro: Q100, Monetaria: Q200, Empresarial: Q1000).
- Endpoints internos para comunicación entre microservicios.

### Tecnologías

- Backend: **Node.js + Express**
- Base de Datos: **MongoDB** (`account-PS`)
- Seguridad: JWT, rate limiting, express-validator

### Endpoints
**Base URL:** `http://localhost:3001/paySmart/v1`

| Método | Ruta                                      | Descripción                    | Authorization |
|--------|-------------------------------------------|--------------------------------|:-------------:|
| GET    | /health                                   | Verificar salud del servidor   | No            |
| POST   | /account                                  | Crear cuenta bancaria          | Sí            |
| GET    | /account                                  | Obtener cuentas del usuario    | Sí            |
| GET    | /account/:accountNumber/balance           | Consultar saldo                | Sí            |
| GET    | /account/internal/:accountNumber/balance  | Consultar cuenta (interno)     | No            |
| PATCH  | /account/internal/:accountNumber/balance  | Actualizar saldo (interno)     | No            |

#### Crear cuenta — JSON
- Headers: `Authorization: Bearer <token>`
```json
{
  "accountType": "AHORRO | MONETARIA | EMPRESARIAL",
  "balance": 500,
  "currency": "GTQ"
}
```

---

## TransactionService

Microservicio de gestión de transacciones bancarias.

### Funcionalidades

- Depósitos en cuentas de usuario.
- Transferencias entre cuentas con validación de saldo y límites (Q2,000 por transacción / Q10,000 diarios).
- Compras de productos mediante descuento de saldo.
- Reversión de depósitos dentro del primer minuto.
- Validaciones: montos negativos, transferencia a la misma cuenta, doble reversión.
- Registro completo de cada transacción (saldo anterior, saldo nuevo, estado).
- Historial de movimientos por cuenta y últimos 5 registros.
- Notificación por email (solo si no se revierten).
- Rollback automático si falla el depósito en cuenta destino.

### Tecnologías

- Backend: **Node.js + Express**
- Base de Datos: **MongoDB** (`transaction-PS`)
- HTTP requests: **Axios**
- Emails: SMTP con Nodemailer

### Endpoints
**Base URL:** `http://localhost:3002/paySmart/v1`

| Método | Ruta                                                  | Descripción                        | Authorization |
|--------|-------------------------------------------------------|------------------------------------|:-------------:|
| GET    | /health                                               | Verificar salud del servidor       | No            |
| POST   | /transaction/deposit                                  | Realizar un depósito               | Sí            |
| POST   | /transaction/transfer                                 | Realizar una transferencia         | Sí            |
| POST   | /transaction/purchase                                 | Realizar una compra                | Sí            |
| PUT    | /transaction/reverse/:transactionId                   | Revertir un depósito (< 1 min)     | Sí            |
| GET    | /transaction/:accountNumber                           | Historial de movimientos           | Sí            |
| GET    | /transaction/:accountNumber/last                      | Últimos 5 movimientos              | Sí            |
| GET    | /transaction/internal/stats/accounts-most-movements   | Cuentas con más movimientos        | Sí            |
| GET    | /transaction/internal/admin/accounts-overview         | Resumen de cuentas                 | Sí (Admin)    |

#### Depósito — JSON
- Headers: `Authorization: Bearer <token>`
```json
{
  "accountNumber": "123456789012345678",
  "amount": 500,
  "description": "Depósito inicial"
}
```

#### Transferencia — JSON
- Headers: `Authorization: Bearer <token>`
```json
{
  "fromAccountNumber": "123456789012345678",
  "toAccountNumber": "987654321098765432",
  "amount": 200,
  "description": "Pago de servicio"
}
```

---

## ProductService

Microservicio de gestión de productos disponibles para compra.

### Funcionalidades

- CRUD completo de productos (solo ADMIN).
- Activación y desactivación lógica de productos.
- Consulta de productos disponibles para clientes.
- Control de stock por producto (null = ilimitado).
- Registro de compras con integración al TransactionService.

### Tecnologías

- Backend: **Node.js + Express**
- Base de Datos: **MongoDB** (`product-PS`)
- Seguridad: JWT, validación de roles (ADMIN_ROLE)

### Endpoints
**Base URL:** `http://localhost:3003/paySmart/v1`

| Método | Ruta                       | Descripción                  | Authorization |
|--------|----------------------------|------------------------------|:-------------:|
| GET    | /health                    | Verificar salud del servidor | No            |
| POST   | /products                  | Crear producto               | Sí (Admin)    |
| GET    | /products                  | Obtener todos los productos  | Sí (Admin)    |
| GET    | /products/available/list   | Obtener productos activos    | Sí            |
| GET    | /products/:id              | Obtener producto por ID      | Sí (Admin)    |
| PATCH  | /products/:id              | Actualizar producto          | Sí (Admin)    |
| DELETE | /products/:id              | Desactivar producto          | Sí (Admin)    |
| PATCH  | /products/:id/activate     | Activar producto             | Sí (Admin)    |
| POST   | /purchases                 | Realizar una compra          | Sí            |
| GET    | /purchases/my              | Ver mis compras              | Sí            |
| GET    | /purchases                 | Ver todas las compras        | Sí (Admin)    |
| GET    | /purchases/:id             | Ver compra por ID            | Sí (Admin)    |

#### Crear producto — JSON
- Headers: `Authorization: Bearer <token_admin>`
```json
{
  "name": "Nombre del producto",
  "description": "Descripción",
  "price": 99.99,
  "type": "PRODUCT | SERVICE",
  "stock": 50
}
```

#### Realizar compra — JSON
- Headers: `Authorization: Bearer <token>`
```json
{
  "product": "id_del_producto",
  "quantity": 1,
  "fromAccountNumber": "123456789012345678"
}
```

---

## FavoriteAccountService

Microservicio para gestionar cuentas bancarias favoritas.

### Funcionalidades

- Agregar cuentas favoritas de otros usuarios con alias.
- Listar, editar alias y eliminar cuentas favoritas (soft-delete).
- Activar y desactivar cuentas favoritas independientemente del soft-delete.
- Transferencia rápida a cuenta favorita directamente desde el servicio.

### Tecnologías

- Backend: **Node.js + Express**
- Base de Datos: **MongoDB** (`favorite-PS`)
- Comunicación con AccountService y TransactionService vía Axios

### Endpoints
**Base URL:** `http://localhost:3004/paySmart/v1`

| Método | Ruta                              | Descripción                     | Authorization |
|--------|-----------------------------------|---------------------------------|:-------------:|
| GET    | /health                           | Verificar salud del servidor    | No            |
| POST   | /favoriteAccounts                 | Agregar cuenta favorita         | Sí            |
| GET    | /favoriteAccounts                 | Listar cuentas favoritas        | Sí            |
| PUT    | /favoriteAccounts/:id             | Editar alias                    | Sí            |
| DELETE | /favoriteAccounts/:id             | Eliminar cuenta favorita        | Sí            |
| PATCH  | /favoriteAccounts/:id/deactivate  | Desactivar cuenta favorita      | Sí            |
| PATCH  | /favoriteAccounts/:id/activate    | Activar cuenta favorita         | Sí            |
| POST   | /favoriteAccounts/:id/transfer    | Transferencia rápida            | Sí            |

#### Agregar favorita — JSON
- Headers: `Authorization: Bearer <token>`
```json
{
  "accountNumber": "123456789012345678",
  "alias": "Cuenta mamá"
}
```

#### Transferencia rápida — JSON
- Headers: `Authorization: Bearer <token>`
```json
{
  "fromAccountNumber": "987654321098765432",
  "amount": 100,
  "description": "Envío mensual"
}
```

---

## ReportService

Microservicio de reportes administrativos. No tiene base de datos propia, consume el TransactionService.

### Funcionalidades

- Reporte de cuentas con más movimientos (ordenable ASC/DESC, con límite configurable).
- Reporte de resumen administrativo de cuentas con sus últimos movimientos.

### Tecnologías

- Backend: **Node.js + Express**
- Seguridad: JWT
- Comunicación con TransactionService vía Axios

### Endpoints
**Base URL:** `http://localhost:3005/paySmart/v1`

| Método | Ruta                             | Descripción                       | Authorization |
|--------|----------------------------------|-----------------------------------|:-------------:|
| GET    | /health                          | Verificar salud del servidor      | No            |
| GET    | /reports/accounts-most-movements | Cuentas con más movimientos       | Sí            |
| GET    | /reports/admin/accounts-overview | Resumen administrativo de cuentas | Sí (Admin)    |

#### Cuentas con más movimientos — Query Params
- Headers: `Authorization: Bearer <token>`

| Parámetro | Tipo   | Descripción           | Default |
|-----------|--------|-----------------------|---------|
| order     | string | `asc` o `desc`        | `desc`  |
| limit     | number | Resultados (máx. 100) | `10`    |

Ejemplo: `/reports/accounts-most-movements?order=desc&limit=5`

---

## Estructura del Proyecto

```
paysmart/
├── auth-service/
│   ├── src/
│   │   ├── AuthService.Api/
│   │   ├── AuthService.Application/
│   │   ├── AuthService.Domain/
│   │   └── AuthService.Persistence/
│   ├── AuthService.sln
│   └── global.json
│
├── account-service/
│   ├── configs/
│   ├── middlewares/
│   ├── src/
│   ├── .env.example
│   ├── index.js
│   └── package.json
│
├── transaction-service/
│   ├── configs/
│   ├── middlewares/
│   ├── src/
│   ├── .env.example
│   ├── index.js
│   └── package.json
│
├── product-service/
│   ├── configs/
│   ├── middlewares/
│   ├── src/
│   ├── .env.example
│   ├── index.js
│   └── package.json
│
├── favoriteaccount-service/
│   ├── configs/
│   ├── middlewares/
│   ├── src/
│   ├── .env.example
│   ├── index.js
│   └── package.json
│
├── report-service/
│   ├── configs/
│   ├── middlewares/
│   ├── src/
│   ├── .env.example
│   ├── index.js
│   └── package.json
│
├── postgre_db/
│   └── docker-compose.yml
│
├── .gitignore
├── LICENSE
└── README.md
```

---

## Instalación y Ejecución

### Prerequisitos

- Node.js 18+
- MongoDB 6+
- PostgreSQL 13+
- .NET 8.0 SDK (AuthService)
- pnpm

### Clonar repositorio
```bash
git clone <url-repo>
```

### Base de Datos (PostgreSQL con Docker)
```bash
cd .\postgre_db\
docker compose down -v
docker compose up -d
```

### AuthService
```bash
cd .\auth-service\src\AuthService.Api\
# Copiar appsettings.example.json como appsettings.json y completar los valores
dotnet restore
dotnet build
dotnet run
```

### AccountService
```bash
cd .\account-service\
# Copiar .env.example como .env y completar los valores
pnpm install
pnpm run dev
```

### TransactionService
```bash
cd .\transaction-service\
# Copiar .env.example como .env y completar los valores
pnpm install
pnpm run dev
```

### ProductService
```bash
cd .\product-service\
# Copiar .env.example como .env y completar los valores
pnpm install
pnpm run dev
```

### FavoriteAccountService
```bash
cd .\favoriteaccount-service\
# Copiar .env.example como .env y completar los valores
pnpm install
pnpm run dev
```

### ReportService
```bash
cd .\report-service\
# Copiar .env.example como .env y completar los valores
pnpm install
pnpm run dev
```