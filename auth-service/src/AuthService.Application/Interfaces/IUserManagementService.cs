using AuthService.Application.DTOs;

namespace AuthService.Application.Interfaces;

public interface IUserManagementService
{
    Task<UserResponseDto> UpdateUserRoleAsync(string userId, string roleName);
    Task<IReadOnlyList<string>> GetUserRolesAsync(string userId);
    Task<IReadOnlyList<UserResponseDto>> GetUsersByRoleAsync(string roleName);
    Task<IReadOnlyList<UserResponseDto>> GetAllClientsAsync();
    Task<UserResponseDto> GetClientByIdAsync(string userId);
    Task<UserResponseDto> UpdateClientProfileAsync(string userId, UpdateClientProfileDto dto);
    Task<bool> DeleteClientAsync(string adminUserId, string targetUserId);
}
