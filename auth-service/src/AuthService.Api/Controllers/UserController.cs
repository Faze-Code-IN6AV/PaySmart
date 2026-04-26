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

    /// <summary>
    /// Actualizar el rol de un usuario. Solo accesible por ADMIN_ROLE.
    /// </summary>
    /// <param name="userId">ID del usuario a actualizar.</param>
    /// <param name="dto">Nuevo rol a asignar. Valores válidos: <c>ADMIN_ROLE</c>, <c>USER_ROLE</c>.</param>
    /// <response code="200">Rol actualizado exitosamente.</response>
    /// <response code="401">No autenticado.</response>
    /// <response code="403">No tienes permisos de administrador.</response>
    /// <response code="404">Usuario no encontrado.</response>
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
    /// <param name="userId">ID del usuario a consultar.</param>
    /// <response code="200">Lista de roles del usuario.</response>
    /// <response code="401">No autenticado.</response>
    /// <response code="404">Usuario no encontrado.</response>
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
    /// Obtener todos los usuarios que tienen un rol específico. Solo accesible por ADMIN_ROLE.
    /// </summary>
    /// <param name="roleName">Nombre del rol a filtrar. Ejemplo: <c>ADMIN_ROLE</c> o <c>USER_ROLE</c>.</param>
    /// <response code="200">Lista de usuarios con el rol indicado.</response>
    /// <response code="401">No autenticado.</response>
    /// <response code="403">No tienes permisos de administrador.</response>
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