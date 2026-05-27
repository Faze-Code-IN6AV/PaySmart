using AuthService.Application.DTOs;
using AuthService.Application.Interfaces;
using AuthService.Domain.Constants;
using AuthService.Domain.Entities;
using AuthService.Domain.Interfaces;

namespace AuthService.Application.Services;

public class UserManagementService(IUserRepository users, IRoleRepository roles) : IUserManagementService
{
    // ─── Helpers ──────────────────────────────────────────────────────────────
    private static UserResponseDto MapToDto(User u, string? roleOverride = null)
    {
        var role = roleOverride ?? u.UserRoles.FirstOrDefault()?.Role?.Name ?? RoleConstants.USER_ROLE;
        return new UserResponseDto
        {
            Id             = u.Id,
            Name           = u.Name,
            Surname        = u.Surname,
            Username       = u.Username,
            Email          = u.Email,
            Phone          = u.UserProfile?.Phone        ?? string.Empty,
            DPI            = u.UserProfile?.DPI          ?? string.Empty,
            Address        = u.UserProfile?.Address      ?? string.Empty,
            WorkName       = u.UserProfile?.WorkName     ?? string.Empty,
            MonthlyIncome  = u.UserProfile?.MonthlyIncome ?? 0,
            Role           = role,
            Status         = u.Status,
            IsEmailVerified = u.UserEmail?.EmailVerified ?? false,
            CreatedAt      = u.CreatedAt,
            UpdatedAt      = u.UpdatedAt
        };
    }

    // ─── Cambiar rol de usuario ───────────────────────────────────────────────
    public async Task<UserResponseDto> UpdateUserRoleAsync(string userId, string roleName)
    {
        roleName = roleName?.Trim().ToUpperInvariant() ?? string.Empty;

        if (string.IsNullOrWhiteSpace(userId)) throw new ArgumentException("Invalid userId", nameof(userId));
        if (!RoleConstants.AllowedRoles.Contains(roleName))
            throw new InvalidOperationException($"Role not allowed. Use {RoleConstants.ADMIN_ROLE} or {RoleConstants.USER_ROLE}");

        var user = await users.GetByIdAsync(userId);

        var isUserAdmin = user.UserRoles.Any(r => r.Role.Name == RoleConstants.ADMIN_ROLE);
        if (isUserAdmin && roleName != RoleConstants.ADMIN_ROLE)
        {
            var adminCount = await roles.CountUsersInRoleAsync(RoleConstants.ADMIN_ROLE);
            if (adminCount <= 1)
                throw new InvalidOperationException("Cannot remove the last administrator");
        }

        var role = await roles.GetByNameAsync(roleName)
                       ?? throw new InvalidOperationException($"Role {roleName} not found");

        await users.UpdateUserRoleAsync(userId, role.Id);
        user = await users.GetByIdAsync(userId);

        return MapToDto(user, role.Name);
    }

    public async Task<IReadOnlyList<string>> GetUserRolesAsync(string userId)
    {
        return await roles.GetUserRoleNamesAsync(userId);
    }

    public async Task<IReadOnlyList<UserResponseDto>> GetUsersByRoleAsync(string roleName)
    {
        roleName = roleName?.Trim().ToUpperInvariant() ?? string.Empty;
        var usersInRole = await roles.GetUsersByRoleAsync(roleName);
        return usersInRole.Select(u => MapToDto(u, roleName)).ToList();
    }

    // ─── Listar todos los clientes (solo USER_ROLE) ───────────────────────────
    public async Task<IReadOnlyList<UserResponseDto>> GetAllClientsAsync()
    {
        var clients = await users.GetAllClientUsersAsync();
        return clients.Select(u => MapToDto(u)).ToList();
    }

    // ─── Ver cliente por ID ───────────────────────────────────────────────────
    public async Task<UserResponseDto> GetClientByIdAsync(string userId)
    {
        var user = await users.GetByIdAsync(userId);
        return MapToDto(user);
    }

    // ─── Admin edita perfil de cliente (sin tocar DPI ni contraseña) ─────────
    public async Task<UserResponseDto> UpdateClientProfileAsync(string userId, UpdateClientProfileDto dto)
    {
        var user = await users.GetByIdAsync(userId);

        // Protección: admin no puede editar otro admin
        var isAdmin = user.UserRoles.Any(r => r.Role.Name == RoleConstants.ADMIN_ROLE);
        if (isAdmin)
            throw new InvalidOperationException("El administrador no puede modificar los datos de otro administrador");

        // Campos requeridos: no pueden enviarse vacíos
        if (dto.Name != null && string.IsNullOrWhiteSpace(dto.Name))
            throw new InvalidOperationException("El nombre no puede estar vacío");
        if (dto.Surname != null && string.IsNullOrWhiteSpace(dto.Surname))
            throw new InvalidOperationException("El apellido no puede estar vacío");

        // Campos editables del User
        if (dto.Name    != null) user.Name    = dto.Name;
        if (dto.Surname != null) user.Surname = dto.Surname;

        // Campos editables del perfil (NO DPI)
        if (user.UserProfile != null)
        {
            if (dto.Phone    != null) user.UserProfile.Phone    = dto.Phone;
            if (dto.Address  != null) user.UserProfile.Address  = dto.Address;
            if (dto.WorkName != null) user.UserProfile.WorkName = dto.WorkName;
            if (dto.MonthlyIncome.HasValue)
            {
                if (dto.MonthlyIncome.Value < 100)
                    throw new InvalidOperationException("Los ingresos mensuales deben ser al menos Q100.00");
                user.UserProfile.MonthlyIncome = dto.MonthlyIncome.Value;
            }
        }

        var updated = await users.UpdateUserAsync(user);
        return MapToDto(updated);
    }

    // ─── Admin elimina cliente (no puede eliminar otro admin) ────────────────
    public async Task<bool> DeleteClientAsync(string adminUserId, string targetUserId)
    {
        if (adminUserId == targetUserId)
            throw new InvalidOperationException("No puedes eliminar tu propia cuenta");

        var target = await users.GetByIdAsync(targetUserId);

        var isAdmin = target.UserRoles.Any(r => r.Role.Name == RoleConstants.ADMIN_ROLE);
        if (isAdmin)
            throw new InvalidOperationException("No se puede eliminar a otro administrador");

        return await users.DeleteUserAsync(targetUserId);
    }

    // ─── Admin reactiva cliente dado de baja ─────────────────────────────────
    public async Task<bool> ReactivateClientAsync(string adminUserId, string targetUserId)
    {
        if (adminUserId == targetUserId)
            throw new InvalidOperationException("No puedes reactivar tu propia cuenta desde este endpoint");

        var target = await users.GetByIdAsync(targetUserId);

        var isAdmin = target.UserRoles.Any(r => r.Role.Name == RoleConstants.ADMIN_ROLE);
        if (isAdmin)
            throw new InvalidOperationException("No se puede reactivar a otro administrador desde este endpoint");

        if (!target.IsDeleted)
            throw new InvalidOperationException("El cliente ya está activo");

        return await users.ReactivateUserAsync(targetUserId);
    }
}
