# PaySmart

Sistema de pagos basado en arquitectura de microservicios, desarrollado como parte del curso IN6AV - Kinal Guatemala 2026.

---

## Microservicios Implementados

- **AuthService**: Autenticación, gestión de usuarios y perfiles extendidos.
- **AccountService**: Gestión de cuentas bancarias y saldo disponible.
- **TransactionService**: Gestión de transacciones y depósitos entre cuentas bancarias.
- **ProductService**: Gestión de productos disponibles para compra.
- **FavoriteAccountService**: Gestión de cuentas favoritas y transferencias rápidas.
- **ReportService**: Reportes administrativos de movimientos y cuentas.
- **client-admin**: Frontend web (React + Vite) para administradores y clientes.
- **client-user**: Aplicación móvil (React Native + Expo) para clientes.

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
- Registro por Admin, login, JWT, roles, verificación de email, recuperación de contraseña, perfiles extendidos (DPI, dirección, trabajo, ingresos), soft-delete de usuarios, creación de cuentas, transacciones, historial, productos, compras, cuentas favoritas y reportes implementados.
- Arquitectura basada en **Clean Architecture** (AuthService) y buenas prácticas de microservicios.
- Frontend SPA con panel diferenciado por rol (Admin / Cliente), rutas protegidas y conversor de divisas en tiempo real.

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
| client-admin (dev)     | 5173   |
| client-user (Expo dev) | 8081   |

---

## AuthService

Microservicio de autenticación y gestión de usuarios.

### Funcionalidades

- Registro de usuarios con verificación de email obligatoria (incluye perfil extendido: DPI, dirección, trabajo, ingresos).
- Creación de clientes por parte del Administrador (sin necesidad de verificación de email).
- Login con email o username; solo permite acceso a cuentas verificadas.
- Reenvío de email de verificación.
- Recuperación y reset de contraseña por email con token expirable.
- Perfil de usuario autenticado y edición de perfil propio (nombre, dirección, trabajo, ingresos).
- CRUD completo de clientes para administradores (listar, ver, editar, eliminar con soft-delete).
- Soft-delete de usuarios (`is_deleted`, `deleted_at`).
- Sistema de roles y permisos (USER_ROLE, ADMIN_ROLE).
- Protecciones de seguridad: hashing con Argon2, JWT expirables, rate limiting, security headers.

### Tecnologías

- Backend: **ASP.NET Core 8.0**
- Base de Datos: **PostgreSQL** con EF Core 9.0
- Seguridad: JWT, Argon2, headers de seguridad (HSTS, XSS, etc.)
- Validación y logging: FluentValidation, Serilog
- Emails: SMTP (Gmail), plantillas HTML
- Documentación: Swagger/OpenAPI

### Migraciones de Base de Datos

| Migración                     | Descripción                                                                                          |
|-------------------------------|------------------------------------------------------------------------------------------------------|
| `InitialAdd`                  | Tablas base: usuarios, roles, perfiles, emails, resets de contraseña                                 |
| `AddProfileFields`            | Agrega `dpi`, `address`, `work_name`, `monthly_income`, `created_at`, `updated_at` a `user_profiles` |
| `SoftDeleteAndRelationships`  | Agrega `is_deleted` y `deleted_at` a la tabla `users`                                                |

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

| Método | Ruta                              | Descripción                               | Authorization   |
|--------|-----------------------------------|-------------------------------------------|:---------------:|
| GET    | /health                           | Verificar salud del servidor              | No              |
| POST   | /auth/register                    | Registrar nuevo usuario (auto-registro)   | No              |
| POST   | /auth/verify-email                | Verificar email                           | No              |
| POST   | /auth/resend-verification         | Reenviar email de verificación            | No              |
| POST   | /auth/login                       | Iniciar sesión                            | No              |
| POST   | /auth/forgot-password             | Solicitar reset de contraseña             | No              |
| POST   | /auth/reset-password              | Confirmar reset de contraseña             | No              |
| GET    | /auth/profile                     | Ver perfil del usuario autenticado        | Sí              |
| PUT    | /auth/profile                     | Editar perfil propio (campos permitidos)  | Sí              |
| POST   | /auth/profile/by-id               | Ver perfil por userId                     | No              |
| POST   | /auth/admin/create-client         | Admin crea un nuevo cliente               | Sí (Admin)      |
| GET    | /users/clients                    | Listar todos los clientes                 | Sí (Admin)      |
| GET    | /users/clients/{userId}           | Ver cliente por ID                        | Sí (Admin)      |
| PUT    | /users/clients/{userId}           | Editar cliente                            | Sí (Admin)      |
| DELETE | /users/clients/{userId}           | Eliminar cliente (soft-delete)            | Sí (Admin)      |
| PUT    | /users/{userId}/role              | Actualizar role de un usuario             | Sí (Admin)      |
| GET    | /users/{userId}/roles             | Ver roles de un usuario                   | Sí (Admin)      |
| GET    | /users/by-role/{roleName}         | Ver usuarios por role                     | Sí (Admin)      |

#### Registrar usuario — Form-Data
```json
{
  "name": "nombre",
  "surname": "apellido",
  "username": "usuario",
  "email": "correo@ejemplo.com",
  "password": "password",
  "phone": "12345678",
  "dpi": "1234567890123",
  "address": "Zona 1, Ciudad de Guatemala",
  "workName": "Empresa S.A.",
  "monthlyIncome": 5000
}
```

#### Admin crea cliente — JSON
- Headers: `Authorization: Bearer <token_admin>`
```json
{
  "name": "nombre",
  "surname": "apellido",
  "username": "usuario",
  "email": "correo@ejemplo.com",
  "password": "password",
  "phone": "12345678",
  "dpi": "1234567890123",
  "address": "Zona 1, Ciudad de Guatemala",
  "workName": "Empresa S.A.",
  "monthlyIncome": 5000
}
```

#### Login — JSON
```json
{
  "emailOrUsername": "usuario_o_correo",
  "password": "password"
}
```

#### Editar perfil propio — JSON
- Headers: `Authorization: Bearer <token>`
```json
{
  "name": "NuevoNombre",
  "surname": "NuevoApellido",
  "address": "Nueva dirección",
  "workName": "Nuevo trabajo",
  "monthlyIncome": 6000
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

## client-admin (Frontend)

Aplicación web SPA desarrollada con React 19 + Vite. Ofrece dos experiencias diferenciadas según el rol del usuario autenticado.

### Tecnologías

- Framework: **React 19** + **Vite 8**
- Estilos: **Tailwind CSS v4**
- Componentes UI: **@material-tailwind/react**, **@heroicons/react**
- Estado global: **Zustand 5** (con persistencia en localStorage)
- Formularios: **react-hook-form**
- Notificaciones: **react-hot-toast**
- Routing: **react-router-dom v7**
- HTTP: **Axios** (instancias por microservicio con interceptores JWT)

### Funcionalidades

- Autenticación con sesión persistente y expiración automática.
- Panel diferenciado por rol: **Admin** y **Cliente**.
- Rutas protegidas (`ProtectedRoute`) y guardias de rol (`RoleGuard`).
- Sidebar responsivo con menú colapsable en móvil.

### Variables de Entorno

Crea un archivo `.env` en `client-admin/` con:

```env
VITE_AUTH_URL=http://localhost:3000/api/v1
VITE_ACCOUNT_URL=http://localhost:3001/paySmart/v1
VITE_TRANSACTION_URL=http://localhost:3002/paySmart/v1
VITE_PRODUCT_URL=http://localhost:3003/paySmart/v1
VITE_FAVORITE_URL=http://localhost:3004/paySmart/v1
VITE_REPORT_URL=http://localhost:3005/paySmart/v1
```

### Módulos del Panel Admin

| Módulo       | Ruta                     | Descripción                                                                         |
|--------------|--------------------------|-------------------------------------------------------------------------------------|
| Inicio       | `/dashboard`             | Reportes de cuentas con más movimientos y resumen de cuentas + conversor de divisas |
| Clientes     | `/dashboard/clients`     | CRUD completo de clientes: crear, ver detalle, editar y eliminar                    |
| Cuentas      | `/dashboard/accounts`    | Búsqueda y gestión de cuentas por número de cuenta                                  |
| Transacciones| `/dashboard/transactions`| Historial de movimientos con filtros por tipo                                       |
| Productos    | `/dashboard/products`    | Gestión de productos y listado de todas las compras                                 |

### Módulos del Panel Cliente

| Módulo        | Ruta                       | Descripción                                                        |
|---------------|----------------------------|--------------------------------------------------------------------|
| Inicio        | `/dashboard`               | Resumen de reportes propios + conversor de divisas en tiempo real  |
| Mis Cuentas   | `/dashboard/accounts`      | Ver y crear cuentas bancarias (Ahorro, Monetaria, Empresarial)     |
| Transacciones | `/dashboard/transactions`  | Realizar depósitos, transferencias, reversiones y ver historial    |
| Productos     | `/dashboard/products`      | Ver productos disponibles, comprar y revisar mis compras           |
| Favoritas     | `/dashboard/favorites`     | Gestionar cuentas favoritas y realizar transferencias rápidas      |
| Mi Perfil     | `/dashboard/profile`       | Editar nombre, dirección, trabajo e ingresos mensuales             |

### Conversor de Divisas

El panel de inicio incluye un conversor de divisas en tiempo real que consume la API pública `open.er-api.com`. Soporta GTQ, USD, EUR, MXN, HNL, CRC, GBP, JPY, CAD y BRL.

### Instalación

```bash
cd .\client-admin\
# Crear .env con las variables de entorno listadas arriba
pnpm install
pnpm run dev
```

La app estará disponible en `http://localhost:5173`.

---

## client-user (App Móvil)

Aplicación móvil desarrollada con **React Native + Expo**, pensada exclusivamente para clientes.

### Tecnologías

- Framework: **React Native 0.83** + **Expo 55**
- Navegación: **@react-navigation** (bottom-tabs + native-stack)
- Estado global: **Zustand 5**
- Formularios: **react-hook-form**
- Almacenamiento seguro: **expo-secure-store**
- HTTP: **Axios** (instancias por microservicio)

### Funcionalidades

- Autenticación de clientes con sesión persistente (token seguro con `expo-secure-store`).
- Gestión de cuentas bancarias propias (ver y crear).
- Transacciones: depósitos, transferencias, reversiones e historial.
- Productos: ver catálogo, comprar y revisar compras propias.
- Cuentas favoritas y transferencias rápidas.
- Edición de perfil propio.

### Variables de Entorno

Copia `.env.example` como `.env` en `client-user/` y completa los valores:

```env
EXPO_PUBLIC_AUTH_URL=http://IP:3000/api/v1/auth
EXPO_PUBLIC_ACCOUNT_URL=http://IP:3001/paySmart/v1
EXPO_PUBLIC_FAVORITE_URL=http://IP:3004/paySmart/v1
EXPO_PUBLIC_PRODUCT_URL=http://IP:3003/paySmart/v1
EXPO_PUBLIC_REPORT_URL=http://IP:3005/paySmart/v1
EXPO_PUBLIC_TRANSACTION_URL=http://IP:3002/paySmart/v1
```

> **Importante:** en el `.env` real (no en el `.env.example`), cada `IP` debe reemplazarse por la dirección IP de tu propia máquina en la red local (no `localhost`), ya que el dispositivo/emulador de Expo necesita alcanzar los microservicios a través de la red. Lo mismo aplica para el `appsettings.json` del AuthService: donde diga `IP` en el `.env.example` o en `appsettings.example.json`, en el archivo real debe colocarse tu IP local.

### Instalación

```bash
cd .\client-user\
# Copiar .env.example como .env y reemplazar las IP por la de tu máquina
pnpm install
pnpm start
```

Al ejecutar `pnpm start` se abrirá el CLI de Expo:

- Presiona **`?`** para ver todos los comandos disponibles.
- Presiona **`a`** para abrir la app en un emulador/dispositivo Android.

---

## Estructura del Proyecto

```
paysmart/
├── auth-service/
│   ├── src/
│   │   ├── AuthService.Api/
│   │   │   ├── Controllers/         # AuthController, UserController, HealthController
│   │   │   ├── Extensions/          # Auth, RateLimiting, Security, ServiceCollection
│   │   │   ├── Middlewares/         # GlobalExceptionMiddleware
│   │   │   └── Models/
│   │   ├── AuthService.Application/
│   │   │   ├── DTOs/                # RegisterDto, LoginDto, AdminCreateClientDto, UpdateMyProfileDto, etc.
│   │   │   ├── Interfaces/
│   │   │   └── Services/            # AuthService, EmailService, JwtTokenService, UserManagementService
│   │   ├── AuthService.Domain/
│   │   │   ├── Entities/            # User, UserProfile, Role, UserRole, UserEmail, UserPasswordReset
│   │   │   └── Interfaces/
│   │   └── AuthService.Persistence/
│   │       ├── Data/                # ApplicationDbContext, DataSeeder
│   │       ├── Migrations/          # InitialAdd, AddProfileFields, SoftDeleteAndRelationships
│   │       └── Repositories/
│   ├── AuthService.sln
│   └── global.json
│
├── account-service/
│   ├── configs/
│   ├── middlewares/
│   ├── src/account/
│   ├── .env.example
│   ├── index.js
│   └── package.json
│
├── transaction-service/
│   ├── configs/
│   ├── middlewares/
│   ├── src/transactions/
│   ├── .env.example
│   ├── index.js
│   └── package.json
│
├── product-service/
│   ├── configs/
│   ├── middlewares/
│   ├── src/
│   │   ├── product/
│   │   └── purchase/
│   ├── .env.example
│   ├── index.js
│   └── package.json
│
├── favoriteaccount-service/
│   ├── configs/
│   ├── middlewares/
│   ├── src/favoriteaccounts/
│   ├── .env.example
│   ├── index.js
│   └── package.json
│
├── report-service/
│   ├── configs/
│   ├── middlewares/
│   ├── src/reports/
│   ├── .env.example
│   ├── index.js
│   └── package.json
│
├── client-admin/                       ← Frontend SPA
│   ├── public/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layouts/               # DashboardLayout (sidebar + header responsivo)
│   │   │   └── router/                # AppRouter, ProtectedRoute, RoleGuard
│   │   ├── features/
│   │   │   ├── auth/                  # Login, ForgotPassword, ResetPassword, EditMyProfile
│   │   │   ├── account/               # AccountPage, CreateAccountModal, accountStore
│   │   │   ├── clients/               # AdminClientsPage, CreateClientModal, EditClientModal
│   │   │   ├── transaction/           # TransactionPage, TransactionModal, transactionStore
│   │   │   ├── product/               # ProductPage, BuyProductModal, CreateProductModal
│   │   │   ├── favoriteaccount/       # FavoriteAccountPage, QuickTransferModal
│   │   │   └── report/                # ReportPage, reportStore
│   │   └── shared/
│   │       ├── api/                   # Instancias Axios por microservicio
│   │       ├── components/            # CurrencyConverter
│   │       └── utils/
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── client-user/                        ← App Móvil (Expo)
│   ├── assets/
│   ├── src/
│   │   ├── features/                  # auth, accounts, transactions, products, favorites, profile, home, clients
│   │   ├── navigation/                 # AppNavigator, AuthStack, MainTabs
│   │   └── shared/
│   │       ├── api/                   # Instancias Axios por microservicio
│   │       ├── components/
│   │       ├── hooks/
│   │       └── store/
│   ├── App.jsx
│   ├── app.json
│   ├── index.js
│   ├── .env.example
│   └── package.json
│
├── postgre_db/
│   └── docker-compose.yml
│
├── .gitignore
├── LICENSE
└── README.md
└── PaySmart.postman_collection.json
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

### client-admin (Frontend)
```bash
cd .\client-admin\
# Crear .env con las variables VITE_AUTH_URL, VITE_ACCOUNT_URL, etc.
pnpm install
pnpm run dev
```

### client-user (App Móvil)
```bash
cd .\client-user\
# Copiar .env.example como .env y completar los valores
pnpm install
pnpm start
```
Con el CLI de Expo abierto:
- Presiona `?` para ver los comandos disponibles.
- Presiona `a` para abrir la app en el emulador/dispositivo Android.

### Nota importante sobre las IP

En los archivos `.env.example` (client-user) y `appsettings.example.json` (AuthService) las URLs usan el valor literal `IP` como placeholder. Al crear tus archivos reales (`.env` y `appsettings.json`), **debes reemplazar `IP` por la dirección IP de tu propia máquina** en la red local (por ejemplo `192.168.1.X`), y no dejar `localhost`, ya que tanto la app móvil (Expo) como el AuthService necesitan comunicarse con los demás servicios a través de la red local.