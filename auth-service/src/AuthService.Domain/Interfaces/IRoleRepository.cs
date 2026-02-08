using System;
using AuthService.Domain.Entities;

namespace AuthService.Domain.Interfaces;

public interface IRoleRepository
{
    Task<Role?> GetByNameAsync (string roleName);
    Task<int> CountUsersInRoleAsync(string roleName);
    Task<IReadOnlyCollection<User>> GetByRoleAsync (string roleName) ;
    Task<IReadOnlyCollection<string>> GetUserRoleNamesAsync (string userId);
    
}
