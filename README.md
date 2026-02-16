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

### AuthService (/auth)
| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | /auth/register | Registrar nuevo usuario | No |
| POST | /auth/login | Iniciar sesión | No |
| GET  | /auth/profile | Obtener perfil autenticado | Sí |

### AccountService (/account)
| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | /account | Crear cuenta bancaria | Sí |
| GET  | /account | Obtener cuentas del usuario | Sí |
| GET  | /account/:accountNumber/balance | Consultar saldo de una cuenta | Sí |

---

## Instalación y Ejecución

### Prerequisitos

- Node.js 18+  
- MongoDB 6+  
- PostgreSQL 13+  
- .NET 8.0 SDK (AuthService)  

### AccountService

```bash
git clone <url-repo>
cd account-service
pnpm install
pnpm dev
