# PaySmart

Sistema de pagos basado en arquitectura de microservicios, desarrollado como parte del curso IN6AV - Kinal Guatemala 2026 (Entrega 35%).

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
- **MongoDB**: Para gestión de cuentas, transacciones, productos, cuentas favoritas y reportes (demás servicios).

---

## Estado del Proyecto

- Todos los microservicios funcionales y probados.
- Registro, login, JWT, roles, verificación de email, recuperación de contraseña, creación de cuentas, transacciones, historial, productos, compras, cuentas favoritas y reportes implementados.
- Arquitectura basada en **Clean Architecture** (AuthService) y buenas prácticas de microservicios.

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
- Middleware global para manejo de errores.

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

---

## AccountService

Microservicio de gestión de cuentas bancarias.

### Funcionalidades

- Crear cuentas y asociarlas a un usuario autenticado.
- Generar números de cuenta aleatorios de 18 dígitos.
- Consultar todas las cuentas de un usuario.
- Consultar saldo disponible de una cuenta específica.
- Validaciones de saldo mínimo según tipo de cuenta (Ahorro: Q100, Monetaria: Q200, Empresarial: Q1000).
- Endpoints internos para comunicación entre microservicios.

### Tecnologías

- Backend: **Node.js + Express**
- Base de Datos: **MongoDB**
- Seguridad: JWT, rate limiting, validaciones con express-validator, middlewares de manejo de errores.

---

## TransactionService

Microservicio de gestión de transacciones bancarias.

### Funcionalidades

- Depósitos en cuentas de usuario.
- Transferencias entre cuentas con validación de saldo y límites (Q2,000 por transacción / Q10,000 diarios).
- Compras de productos mediante descuento de saldo.
- Reversión de depósitos dentro del primer minuto.
- Registro completo de cada transacción (saldo anterior, saldo nuevo, estado).
- Historial de movimientos por cuenta y últimos 5 registros.
- Notificación por email de depósitos y transferencias (solo si no se revierten).
- Rollback automático si falla el depósito en cuenta destino durante una transferencia.
- Reportes internos de cuentas con más movimientos.

### Tecnologías

- Backend: **Node.js 20 con Express**
- Base de Datos: **MongoDB (Mongoose)**
- HTTP requests: **Axios** (comunicación con AccountService)
- Seguridad: JWT, validaciones de input, manejo de errores centralizado
- Emails: SMTP con Nodemailer

---

## ProductService

Microservicio de gestión de productos disponibles para compra.

### Funcionalidades

- CRUD completo de productos (solo ADMIN).
- Desactivación lógica de productos.
- Consulta de productos disponibles para clientes.
- Control de stock por producto.

### Tecnologías

- Backend: **Node.js + Express**
- Base de Datos: **MongoDB**
- Seguridad: JWT, validación de roles (ADMIN_ROLE)

---

## FavoriteAccountService

Microservicio para gestionar cuentas bancarias favoritas.

### Funcionalidades

- Agregar cuentas favoritas con alias.
- Listar, editar y eliminar cuentas favoritas (soft-delete).
- Activar y desactivar cuentas favoritas.
- Transferencia rápida a cuenta favorita directamente desde el servicio.

### Tecnologías

- Backend: **Node.js + Express**
- Base de Datos: **MongoDB**
- Seguridad: JWT, comunicación con AccountService y TransactionService vía Axios

---

## ReportService

Microservicio de reportes administrativos.

### Funcionalidades

- Reporte de cuentas con más movimientos (ordenable ASC/DESC, con límite configurable).
- Reporte de resumen administrativo de cuentas con sus últimos movimientos.

### Tecnologías

- Backend: **Node.js + Express**
- Seguridad: JWT
- Comunicación con TransactionService vía Axios

---

## Puertos por Servicio

| Servicio               | Puerto |
|------------------------|--------|
| AuthService            | 3000   |
| AccountService         | 3021   |
| TransactionService     | 3030   |
| ProductService         | 3009   |
| FavoriteAccountService | 3035   |
| ReportService          | 3040   |

---

## Endpoints Principales

### AuthService
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

#### Registrar usuario (`/auth/register`) — Form-Data
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

#### Verificar email (`/auth/verify-email`) — JSON
```json
{ "token": "token_que_llego_al_correo" }
```

#### Reenviar verificación (`/auth/resend-verification`) — JSON
```json
{ "email": "correo@ejemplo.com" }
```

#### Login (`/auth/login`) — JSON
```json
{
  "emailOrUsername": "usuario_o_correo",
  "password": "password"
}
```

#### Solicitar reset (`/auth/forgot-password`) — JSON
```json
{ "email": "correo@ejemplo.com" }
```

#### Confirmar reset (`/auth/reset-password`) — JSON
```json
{
  "token": "token_que_llego_al_correo",
  "newPassword": "nueva_password"
}
```

#### Actualizar role (`/users/{userId}/role`) — JSON
- Headers: `Authorization: Bearer <token_admin>`
```json
{ "roleName": "ADMIN_ROLE" }
```

---

### AccountService
**Base URL:** `http://localhost:3021/paySmart/v1`

| Método | Ruta                                      | Descripción                    | Authorization |
|--------|-------------------------------------------|--------------------------------|:-------------:|
| GET    | /health                                   | Verificar salud del servidor   | No            |
| POST   | /account                                  | Crear cuenta bancaria          | Sí            |
| GET    | /account                                  | Obtener cuentas del usuario    | Sí            |
| GET    | /account/:accountNumber/balance           | Consultar saldo                | Sí            |
| GET    | /account/internal/:accountNumber/balance  | Consultar cuenta (interno)     | No            |
| PATCH  | /account/internal/:accountNumber/balance  | Actualizar saldo (interno)     | No            |

#### Crear cuenta (`/account`) — JSON
- Headers: `Authorization: Bearer <token>`
```json
{
  "accountType": "AHORRO | MONETARIA | EMPRESARIAL",
  "balance": 500,
  "currency": "GTQ"
}
```

#### Actualizar saldo interno (`/account/internal/:accountNumber/balance`) — JSON
```json
{
  "amount": 100,
  "type": "DEPOSIT | WITHDRAW"
}
```

---

### TransactionService
**Base URL:** `http://localhost:3030/paySmart/v1`

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
| GET    | /transaction/internal/admin/accounts-overview         | Resumen de cuentas                 | Sí            |

#### Depósito (`/transaction/deposit`) — JSON
- Headers: `Authorization: Bearer <token>`
```json
{
  "accountNumber": "123456789012345678",
  "amount": 500,
  "description": "Depósito inicial"
}
```

#### Transferencia (`/transaction/transfer`) — JSON
- Headers: `Authorization: Bearer <token>`
```json
{
  "fromAccountNumber": "123456789012345678",
  "toAccountNumber": "987654321098765432",
  "amount": 200,
  "description": "Pago de servicio"
}
```

#### Compra (`/transaction/purchase`) — JSON
- Headers: `Authorization: Bearer <token>`
```json
{
  "accountNumber": "123456789012345678",
  "amount": 150,
  "description": "Compra de producto"
}
```

---

### ProductService
**Base URL:** `http://localhost:3009/paySmart/v1`

| Método | Ruta                    | Descripción                  | Authorization |
|--------|-------------------------|------------------------------|:-------------:|
| GET    | /health                 | Verificar salud del servidor | No            |
| POST   | /product                | Crear producto               | Sí (Admin)    |
| GET    | /product                | Obtener todos los productos  | Sí (Admin)    |
| GET    | /product/available/list | Obtener productos activos    | Sí            |
| GET    | /product/:id            | Obtener producto por ID      | Sí (Admin)    |
| PATCH  | /product/:id            | Actualizar producto          | Sí (Admin)    |
| DELETE | /product/:id            | Desactivar producto          | Sí (Admin)    |
| POST   | /purchase               | Realizar una compra          | Sí            |
| GET    | /purchase/my            | Ver mis compras              | Sí            |
| GET    | /purchase               | Ver todas las compras        | Sí (Admin)    |
| GET    | /purchase/:id           | Ver compra por ID            | Sí (Admin)    |

#### Crear producto (`/product`) — JSON
- Headers: `Authorization: Bearer <token_admin>`
```json
{
  "name": "Nombre del producto",
  "price": 99.99,
  "stock": 50,
  "currency": "GTQ"
}
```

#### Realizar compra (`/purchase`) — JSON
- Headers: `Authorization: Bearer <token>`
```json
{
  "product": "id_del_producto",
  "quantity": 2,
  "fromAccountNumber": "123456789012345678"
}
```

---

### FavoriteAccountService
**Base URL:** `http://localhost:3035/paySmart/v1`

| Método | Ruta                     | Descripción                     | Authorization |
|--------|--------------------------|---------------------------------|:-------------:|
| GET    | /health                  | Verificar salud del servidor    | No            |
| POST   | /favorite                | Agregar cuenta favorita         | Sí            |
| GET    | /favorite                | Listar cuentas favoritas        | Sí            |
| PUT    | /favorite/:id            | Editar alias                    | Sí            |
| DELETE | /favorite/:id            | Eliminar cuenta favorita        | Sí            |
| PATCH  | /favorite/:id/deactivate | Desactivar cuenta favorita      | Sí            |
| PATCH  | /favorite/:id/activate   | Activar cuenta favorita         | Sí            |
| POST   | /favorite/:id/transfer   | Transferencia rápida a favorita | Sí            |

#### Agregar favorita (`/favorite`) — JSON
- Headers: `Authorization: Bearer <token>`
```json
{
  "accountNumber": "123456789012345678",
  "alias": "Cuenta mamá"
}
```

#### Transferencia rápida (`/favorite/:id/transfer`) — JSON
- Headers: `Authorization: Bearer <token>`
```json
{
  "fromAccountNumber": "987654321098765432",
  "amount": 100,
  "description": "Envío mensual"
}
```

---

### ReportService
**Base URL:** `http://localhost:3040/paySmart/v1`

| Método | Ruta                             | Descripción                       | Authorization |
|--------|----------------------------------|-----------------------------------|:-------------:|
| GET    | /health                          | Verificar salud del servidor      | No            |
| GET    | /reports/accounts-most-movements | Cuentas con más movimientos       | Sí            |
| GET    | /reports/admin/accounts-overview | Resumen administrativo de cuentas | Sí            |

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