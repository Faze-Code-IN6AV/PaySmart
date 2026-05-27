using AuthService.Application.Services;
using AuthService.Domain.Constants;
using AuthService.Domain.Entities;
using AuthService.Domain.Interfaces;
using AuthService.persistence.Data;
using Microsoft.EntityFrameworkCore;
using AuthService.Application.Exceptions;
using Npgsql;

namespace AuthService.Persistence.Repositories;

public class UserRepository(ApplicationDbContext context) : IUserRepository
{
    private IQueryable<User> UsersWithRelations() =>
        context.Users
            .Include(u => u.UserProfile)
            .Include(u => u.UserEmail)
            .Include(u => u.UserPasswordReset)
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role);

    public async Task<User> GetByIdAsync(string id)
{
    var user = await context.Users
        .IgnoreQueryFilters()
        .Include(u => u.UserProfile)
        .Include(u => u.UserEmail)
        .Include(u => u.UserPasswordReset)
        .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
        .FirstOrDefaultAsync(u => u.Id == id);
    return user ?? throw new InvalidOperationException($"User with id {id} not found.");
}

    public async Task<User?> GetByEmailAsync(string email)
    {
        return await UsersWithRelations()
            .FirstOrDefaultAsync(u => EF.Functions.ILike(u.Email, email));
    }

    public async Task<User?> GetByUsernameAsync(string username)
    {
        return await UsersWithRelations()
            .FirstOrDefaultAsync(u => EF.Functions.ILike(u.Username, username));
    }

    public async Task<User?> GetByEmailVerificationTokenAsync(string token)
    {
        return await UsersWithRelations()
            .FirstOrDefaultAsync(u => u.UserEmail != null &&
                                    u.UserEmail.EmailVerificationToken == token &&
                                    u.UserEmail.EmailVerificationTokenExpiry > DateTime.UtcNow);
    }

    public async Task<User?> GetByPasswordResetTokenAsync(string token)
    {
        return await UsersWithRelations()
            .FirstOrDefaultAsync(u => u.UserPasswordReset != null &&
                                    u.UserPasswordReset.PasswordResetToken == token &&
                                    u.UserPasswordReset.PasswordResetTokenExpiry > DateTime.UtcNow);
    }

    public async Task<User> CreateUserAsync(User user)
    {
        context.Users.Add(user);
        try
        {
            await context.SaveChangesAsync();
        }
        catch (DbUpdateException ex) when (ex.InnerException is PostgresException pgEx)
        {
            switch (pgEx.ConstraintName)
            {
                case "ix_users_username":
                    throw new BusinessException(
                        "USERNAME_BELONGS_TO_INACTIVE_USER",
                        "El usuario con ese username está dado de baja o ya existe.");
                case "ix_users_email":
                    throw new BusinessException(
                        "EMAIL_BELONGS_TO_INACTIVE_USER",
                        "El usuario con ese correo está dado de baja o ya existe.");
                case "ix_user_profiles_dpi":                          // 👈 esto faltaba
                    throw new BusinessException(
                        "DPI_BELONGS_TO_INACTIVE_USER",
                        "El usuario con ese DPI está dado de baja o ya existe.");
                default:
                    throw;
            }
        }

        return await GetByIdAsync(user.Id);
    }

    public async Task<User> UpdateUserAsync(User user)
    {
        await context.SaveChangesAsync();
        return await GetByIdAsync(user.Id);
    }

    public async Task<bool> DeleteUserAsync(string id)
    {
        var user = await GetByIdAsync(id);
        // Borrado lógico: nunca se elimina físicamente un usuario de la BD.
        // Solo se marca como eliminado y se desactiva la cuenta.
        user.IsDeleted = true;
        user.DeletedAt = DateTime.UtcNow;
        user.Status    = false;
        await context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ReactivateUserAsync(string id)
    {
        var user = await context.Users
        .IgnoreQueryFilters()
        .FirstOrDefaultAsync(u => u.Id == id)
        ?? throw new InvalidOperationException($"User with id {id} not found.");

        user.IsDeleted = false;
        user.DeletedAt = null;
        user.Status    = true;
        await context.SaveChangesAsync();
        return true;
    }

    // ─── Checks de unicidad — solo usuarios ACTIVOS ───────────────────────────

    public async Task<bool> ExistsByEmailAsync(string email)
    {
        return await context.Users
            .AnyAsync(u => EF.Functions.ILike(u.Email, email) && !u.IsDeleted);
    }

    public async Task<bool> ExistsByEmailDeletedAsync(string email)
    {
        return await context.Users
            .AnyAsync(u => EF.Functions.ILike(u.Email, email) && u.IsDeleted);
    }

    public async Task<bool> ExistsByUsernameAsync(string username)
    {
        return await context.Users
            .AnyAsync(u => EF.Functions.ILike(u.Username, username) && !u.IsDeleted);
    }

    public async Task<bool> ExistsByUsernameDeletedAsync(string username)
    {
        return await context.Users
            .AnyAsync(u => EF.Functions.ILike(u.Username, username) && u.IsDeleted);
    }

    public async Task<bool> ExistsByDpiAsync(string dpi)
    {
        return await context.UserProfiles
            .Include(p => p.User)
            .AnyAsync(p => p.DPI == dpi && p.User != null && !p.User.IsDeleted);
    }

    public async Task<bool> ExistsByDpiDeletedAsync(string dpi)
    {
        return await context.UserProfiles
            .Include(p => p.User)
            .AnyAsync(p => p.DPI == dpi && p.User != null && p.User.IsDeleted);
    }

    public async Task UpdateUserRoleAsync(string userId, string roleId)
    {
        var existingRoles = await context.UserRoles
            .Where(ur => ur.UserId == userId)
            .ToListAsync();

        context.UserRoles.RemoveRange(existingRoles);

        var newUserRole = new UserRole
        {
            Id = UuidGenerator.GenerateUserId(),
            UserId = userId,
            RoleId = roleId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        context.UserRoles.Add(newUserRole);
        await context.SaveChangesAsync();
    }

    public async Task<IReadOnlyList<User>> GetAllClientUsersAsync()
    {
    return await context.Users
        .IgnoreQueryFilters()
        .Include(u => u.UserProfile)
        .Include(u => u.UserEmail)
        .Include(u => u.UserPasswordReset)
        .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
        .Where(u => u.UserRoles.Any(ur => ur.Role.Name == RoleConstants.USER_ROLE))
        .OrderByDescending(u => u.CreatedAt)
        .ToListAsync();
    }   
}