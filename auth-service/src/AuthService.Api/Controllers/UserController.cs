using AuthService.Application.DTOs;
using AuthService.Application.Interfaces;
using AuthService.Domain.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace AuthService.Api.Controllers;

/// <summary>
/// Endpoints de gestión de usuarios y roles. Algunas acciones solo son accesibles por ADMIN_ROLE.
/// </summary>
[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
[Tags("Users")]
public class UsersController(IUserManagementService userManagementService) : ControllerBase
{
    private async Task<bool> CurrentUserIsAdmin()
    {
        var userId = User.Claims
            .FirstOrDefault(c => c.Type == "sub" ||
                c.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;

        if (string.IsNullOrEmpty(userId)) return false;

        var roles = await userManagementService.GetUserRolesAsync(userId);
        return roles.Contains(RoleConstants.ADMIN_ROLE);
    }

    private string? GetCurrentUserId() =>
        User.Claims.FirstOrDefault(c =>
            c.Type == "sub" ||
            c.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;

    // ─── Listar todos los clientes ─────────────────────────────────────────────
    /// <summary>
    /// [ADMIN] Obtener todos los clientes (USER_ROLE) del banco.
    /// </summary>
    [HttpGet("clients")]
    [Authorize]
    [EnableRateLimiting("ApiPolicy")]
    [ProducesResponseType(typeof(IReadOnlyList<UserResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<IReadOnlyList<UserResponseDto>>> GetAllClients()
    {
        if (!await CurrentUserIsAdmin())
            return StatusCode(403, new { success = false, message = "Forbidden" });

        var clients = await userManagementService.GetAllClientsAsync();
        return Ok(new { success = true, data = clients });
    }

    // ─── Ver cliente por ID ────────────────────────────────────────────────────
    /// <summary>
    /// [ADMIN] Obtener datos completos de un cliente por su ID, incluyendo saldo y perfil.
    /// </summary>
    [HttpGet("clients/{userId}")]
    [Authorize]
    [EnableRateLimiting("ApiPolicy")]
    [ProducesResponseType(typeof(UserResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UserResponseDto>> GetClientById(string userId)
    {
        if (!await CurrentUserIsAdmin())
            return StatusCode(403, new { success = false, message = "Forbidden" });

        var client = await userManagementService.GetClientByIdAsync(userId);
        return Ok(new { success = true, data = client });
    }

    // ─── Editar cliente ────────────────────────────────────────────────────────
    /// <summary>
    /// [ADMIN] Editar datos de un cliente. No permite modificar DPI ni contraseña.
    /// </summary>
    [HttpPut("clients/{userId}")]
    [Authorize]
    [EnableRateLimiting("ApiPolicy")]
    [ProducesResponseType(typeof(UserResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UserResponseDto>> UpdateClient(string userId, [FromBody] UpdateClientProfileDto dto)
    {
        if (!await CurrentUserIsAdmin())
            return StatusCode(403, new { success = false, message = "Forbidden" });

        var result = await userManagementService.UpdateClientProfileAsync(userId, dto);
        return Ok(new { success = true, message = "Cliente actualizado exitosamente", data = result });
    }

    // ─── Eliminar cliente ──────────────────────────────────────────────────────
    /// <summary>
    /// [ADMIN] Eliminar un cliente. No puede eliminar a otro administrador.
    /// </summary>
    [HttpDelete("clients/{userId}")]
    [Authorize]
    [EnableRateLimiting("ApiPolicy")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> DeleteClient(string userId)
    {
        if (!await CurrentUserIsAdmin())
            return StatusCode(403, new { success = false, message = "Forbidden" });

        var adminId = GetCurrentUserId() ?? string.Empty;
        await userManagementService.DeleteClientAsync(adminId, userId);
        return Ok(new { success = true, message = "Cliente eliminado exitosamente" });
    }

    // ─── Cambiar rol de usuario ────────────────────────────────────────────────
    /// <summary>
    /// [ADMIN] Actualizar el rol de un usuario.
    /// </summary>
    [HttpPut("{userId}/role")]
    [Authorize]
    [EnableRateLimiting("ApiPolicy")]
    [ProducesResponseType(typeof(UserResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UserResponseDto>> UpdateUserRole(string userId, [FromBody] UpdateUserRoleDto dto)
    {
        if (!await CurrentUserIsAdmin())
            return StatusCode(403, new { success = false, message = "Forbidden" });

        var result = await userManagementService.UpdateUserRoleAsync(userId, dto.RoleName);
        return Ok(result);
    }

    /// <summary>
    /// Obtener los roles asignados a un usuario específico.
    /// </summary>
    [HttpGet("{userId}/roles")]
    [Authorize]
    [ProducesResponseType(typeof(IReadOnlyList<string>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<IReadOnlyList<string>>> GetUserRoles(string userId)
    {
        var roles = await userManagementService.GetUserRolesAsync(userId);
        return Ok(roles);
    }

    /// <summary>
    /// [ADMIN] Obtener todos los usuarios que tienen un rol específico.
    /// </summary>
    [HttpGet("by-role/{roleName}")]
    [Authorize]
    [EnableRateLimiting("ApiPolicy")]
    [ProducesResponseType(typeof(IReadOnlyList<UserResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<IReadOnlyList<UserResponseDto>>> GetUsersByRole(string roleName)
    {
        if (!await CurrentUserIsAdmin())
            return StatusCode(403, new { success = false, message = "Forbidden" });

        var users = await userManagementService.GetUsersByRoleAsync(roleName);
        return Ok(users);
    }
}