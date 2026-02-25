# PaySmart

Sistema de pagos basado en arquitectura de microservicios, desarrollado como parte del curso IN6AV - Kinal Guatemala 2026 (Entrega 35%).

---

## Microservicios Implementados

Actualmente se han desarrollado y probado los siguientes servicios:

- **AuthService**: Autenticación y gestión de usuarios.
- **AccountService**: Gestión de cuentas bancarias y saldo disponible.

Servicios planeados para próximas entregas:

- TransactionService
- ProductService
- FavoriteService
- ReportService

---

## Base de Datos

- **PostgreSQL**: Para gestión de usuarios y roles (AuthService).  
- **MongoDB**: Para gestión de cuentas y transacciones (AccountService).

---

## Estado del Proyecto

- Entrega 35% completada: **AuthService** y **AccountService** funcionales.  
- Registro, login, JWT, roles, creación de cuentas, asociación a usuarios y consulta de saldo implementados.  
- Arquitectura basada en **Clean Architecture** y buenas prácticas de microservicios.

---

## AuthService

Microservicio de autenticación y gestión de usuarios.

### Funcionalidades

- Registro y login de usuarios con JWT.  
- Gestión de perfiles de usuario.  
- Sistema de roles y permisos.  
- Protecciones de seguridad: hashing de contraseñas, JWT expirables, rate limiting.  
- Middleware global para manejo de errores y validaciones.

### Tecnologías

- Backend: **ASP.NET Core 8.0**  
- Base de Datos: **PostgreSQL** con EF Core 9.0  
- Seguridad: JWT, Argon2, headers de seguridad (HSTS, XSS, etc.)  
- Validación y logging: FluentValidation, Serilog  
- Emails: SMTP (Gmail), plantillas HTML  
- Documentación: Swagger/OpenAPI  

---

## AccountService

Microservicio de gestión de cuentas bancarias.

### Funcionalidades

- Crear cuentas y asociarlas a un usuario autenticado.  
- Generar números de cuenta aleatorios.  
- Consultar todas las cuentas de un usuario.  
- Consultar saldo disponible de una cuenta específica.  
- Validaciones de saldo mínimo según tipo de cuenta (Ahorro, Monetaria, Empresarial).  
- Seguridad: JWT para proteger endpoints, manejo de errores y validaciones centralizadas.  

### Tecnologías

- Backend: **Node.js + Express**  
- Base de Datos: **MongoDB**  
- Seguridad: JWT, rate limiting, validaciones con express-validator, middlewares de manejo de errores.  

---

## Endpoints Principales
## Base URL  *http://localhost:5064/api/v1*

### AuthService (/auth)


| Método | Ruta                        | Descripción                   | Authorization |
|--------|-----------------------------|-------------------------------|---------------|
| POST   | /health                     | Verificar salud del servidor  |       No      |
| POST   | /auth/register              | Registrar nuevo usuario       |       No      |
| GET    | /auth/verify-email          | Verificar email de un usuario |       No      |
| POST   | /auth/login                 | Iniciar sesión                |       No      |
| PUT    | /users/{id}/role            | Actualizar role de un usuario |       Si      | 
| GET    | /users/{id}/roles           | Ver el role de un usario      |       Si      |
| GET    | /users/by-role/{Name_Role}  | Ver usuario de un role        |       Si      |

### Modelos de Request

#### Registrar un usuario (/auth/register) - Form-Data
```json
{
  "name": "nombre",
  "surname": "apellido",
  "username": "usuario",
  "email": "correo",
  "password": "password",
  "phone":"phone"
}
```

#### Verificar un usuario (/auth/verify-email) - JSON
```json
{
  "token": "token"
}
```

#### Login del usuario (/auth/login) - JSON
```json
{
  "EmailOrUsername": "EmailOrUsername",
  "Password":"Password"
}
```

#### Actualizar role de un usuario (/users/{id}/role) - JSON
- Headers: `Authorization: Bearer <token(admin))>`
```json
{
  "roleName": "ADMIN_ROLE"
}
```

### AccountService (/account)
| Método | Ruta                                     | Descripción                   | Authorization |
|--------|------------------------------------------|-------------------------------|---------------|
| POST   | /health                                  | Verificar salud del servidor  |       No      |
| POST   | /account                                 | Crear cuenta bancaria         |       Sí      |
| GET    | /account                                 | Obtener cuentas del usuario   |       Sí      |
| GET    | /account/:accountNumber/balance          | Consultar saldo de una cuenta |       Sí      |
| GET    | /account/internal/:accountNumber/balance | Consultar una cuenta          |       No      |
| PATCH  | /account/internal/:accountNumber/balance | Agregar depositos             |       No      |

### Modelos de Request

#### Crear una cuenta bancaria (/account) - JSON
- Headers: `Authorization: Bearer <token)>`
```json
{
  "accountType": "accountType",
  "balance": balance,
  "currency": "GTQ"
}
```

#### Agregar un deposito a una cuenta (/account/internal/:accountNumber/balance) - JSON
```json
{
    "amount":"amoun",
    "type":"DEPOSIT"
}
```
---

## Estructura

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
│   ├── node_modules/
│   ├── src/                         
│   ├── .env                          
│   ├── index.js                      
│   ├── package.json
│   └── pnpm-lock.yaml
│
├── transaction-service/
│   ├── configs/
│   ├── middlewares/
│   ├── node_modules/
│   ├── src/
│   ├── .env
│   ├── index.js
│   ├── package.json
│   └── pnpm-lock.yaml
│
├── postgres_db/
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

### Clonar repositorio
```bash
git clone <url-repo>
```

### Postgre_DB
```bash
cd .\postgre_db\
docker compose down -v
docker compose up -d
```

### AuthService
```bash
cd .\auth-service\src\AuthService.Api\
dotnet restore
dotnet build
dotnet run
```

### AccountService

```bash
cd .\account-service\
pnpm install
pnpm run dev
```

### TransactionService
```bash
cd cd .\transaction-service\
pnpm install
pnpm run dev
```