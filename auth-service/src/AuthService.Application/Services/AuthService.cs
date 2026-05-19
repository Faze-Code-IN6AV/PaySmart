using AuthService.Application.DTOs;
using AuthService.Application.Interfaces;
using AuthService.Application.Exceptions;
using AuthService.Application.Extensions;
using AuthService.Domain.Constants;
using AuthService.Domain.Entities;
using AuthService.Domain.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using AuthService.Application.DTOs.Email;

namespace AuthService.Application.Services;

public class AuthService(
    IUserRepository userRepository,
    IRoleRepository roleRepository,
    IPasswordHashService passwordHashService,
    IJwtTokenService jwtTokenService,
    IEmailService emailService,
    IConfiguration configuration,
    ILogger<AuthService> logger) : IAuthService
{
    // ─── Helper para construir User desde campos comunes ──────────────────────
    private async Task<User> BuildUserAsync(
        string name, string surname, string username, string email,
        string password, string phone, string dpi, string address,
        string workName, decimal monthlyIncome, bool emailVerified = false)
    {
        var userId            = UuidGenerator.GenerateUserId();
        var userProfileId     = UuidGenerator.GenerateUserId();
        var userEmailId       = UuidGenerator.GenerateUserId();
        var userRoleId        = UuidGenerator.GenerateUserId();
        var userPasswordReset = UuidGenerator.GenerateUserId();

        var defaultRole = await roleRepository.GetByNameAsync(RoleConstants.USER_ROLE)
            ?? throw new InvalidOperationException($"Role '{RoleConstants.USER_ROLE}' not found.");

        string? verificationToken = emailVerified ? null : TokenGenerator.GenerateEmailVerificationToken();

        return new User
        {
            Id       = userId,
            Name     = name,
            Surname  = surname,
            Username = username,
            Email    = email.ToLowerInvariant(),
            Password = passwordHashService.HashPassword(password),
            Status   = emailVerified, // admin-created clients start active (already verified)
            UserProfile = new UserProfile
            {
                Id           = userProfileId,
                UserId       = userId,
                Phone        = phone,
                DPI          = dpi,
                Address      = address,
                WorkName     = workName,
                MonthlyIncome = monthlyIncome
            },
            UserEmail = new UserEmail
            {
                Id                           = userEmailId,
                UserId                       = userId,
                EmailVerified                = emailVerified,
                EmailVerificationToken       = verificationToken,
                EmailVerificationTokenExpiry = emailVerified ? null : DateTime.UtcNow.AddHours(24)
            },
            UserRoles =
            [
                new Domain.Entities.UserRole
                {
                    Id     = userRoleId,
                    UserId = userId,
                    RoleId = defaultRole.Id
                }
            ],
            UserPasswordReset = new UserPasswordReset
            {
                Id                       = userPasswordReset,
                UserId                   = userId,
                PasswordResetToken       = null,
                PasswordResetTokenExpiry = null
            }
        };
    }

    // ─── Registro público (self-register) ────────────────────────────────────
    public async Task<RegisterResponseDto> RegisterAsync(RegisterDto registerDto)
    {
        if (await userRepository.ExistsByEmailAsync(registerDto.Email))
        {
            logger.LogRegistrationWithExistingEmail();
            throw new BusinessException(ErrorCodes.EMAIL_ALREADY_EXISTS, "Email already exists");
        }

        if (await userRepository.ExistsByUsernameAsync(registerDto.Username))
        {
            logger.LogRegistrationWithExistingUsername();
            throw new BusinessException(ErrorCodes.USERNAME_ALREADY_EXISTS, "Username already exists");
        }

        if (await userRepository.ExistsByDpiAsync(registerDto.DPI))
            throw new BusinessException("DPI_ALREADY_EXISTS", "Ya existe un usuario registrado con ese DPI");

        if (registerDto.MonthlyIncome < 100)
            throw new BusinessException("INSUFFICIENT_INCOME", "Los ingresos mensuales deben ser al menos Q100.00 para crear la cuenta");

        var user = await BuildUserAsync(
            registerDto.Name, registerDto.Surname, registerDto.Username,
            registerDto.Email, registerDto.Password, registerDto.Phone,
            registerDto.DPI, registerDto.Address, registerDto.WorkName,
            registerDto.MonthlyIncome, emailVerified: false);

        var createdUser = await userRepository.CreateUserAsync(user);
        logger.LogUserRegistered(createdUser.Username);

        var verificationToken = createdUser.UserEmail?.EmailVerificationToken ?? string.Empty;
        _ = Task.Run(async () =>
        {
            try
            {
                await emailService.SendEmailVerificationAsync(createdUser.Email, createdUser.Username, verificationToken);
                logger.LogInformation("Verification email sent");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to send verification email");
            }
        });

        return new RegisterResponseDto
        {
            Success = true,
            User = MapToUserResponseDto(createdUser),
            Message = "Usuario registrado exitosamente. Por favor, verifica tu email para activar la cuenta.",
            EmailVerificationRequired = true
        };
    }

    // ─── Crear cliente (solo ADMIN) ───────────────────────────────────────────
    public async Task<RegisterResponseDto> AdminCreateClientAsync(AdminCreateClientDto dto)
    {
        if (await userRepository.ExistsByEmailAsync(dto.Email))
            throw new BusinessException(ErrorCodes.EMAIL_ALREADY_EXISTS, "Ya existe un usuario con ese email");

        if (await userRepository.ExistsByUsernameAsync(dto.Username))
            throw new BusinessException(ErrorCodes.USERNAME_ALREADY_EXISTS, "El username ya está en uso");

        if (await userRepository.ExistsByDpiAsync(dto.DPI))
            throw new BusinessException("DPI_ALREADY_EXISTS", "Ya existe un usuario registrado con ese DPI");

        if (dto.MonthlyIncome < 100)
            throw new BusinessException("INSUFFICIENT_INCOME", "Los ingresos mensuales deben ser al menos Q100.00 para crear la cuenta");

        // El admin crea la cuenta ya verificada y activa
        var user = await BuildUserAsync(
            dto.Name, dto.Surname, dto.Username, dto.Email,
            dto.Password, dto.Phone, dto.DPI, dto.Address,
            dto.WorkName, dto.MonthlyIncome, emailVerified: true);

        var createdUser = await userRepository.CreateUserAsync(user);
        logger.LogUserRegistered(createdUser.Username);

        // Notificar al cliente por correo con sus credenciales
        _ = Task.Run(async () =>
        {
            try
            {
                await emailService.SendClientCreatedAsync(createdUser.Email, createdUser.Username, dto.Password);
                logger.LogInformation("Credenciales enviadas por correo a {Email}", createdUser.Email);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "No se pudo enviar el correo de bienvenida al cliente {Email}", createdUser.Email);
            }
        });

        return new RegisterResponseDto
        {
            Success = true,
            User = MapToUserResponseDto(createdUser),
            Message = "Cliente creado exitosamente por el administrador.",
            EmailVerificationRequired = false
        };
    }

    // ─── Actualizar perfil propio (cliente) ───────────────────────────────────
    public async Task<UserResponseDto> UpdateMyProfileAsync(string userId, UpdateMyProfileDto dto)
    {
        var user = await userRepository.GetByIdAsync(userId);

        if (dto.Name != null)    user.Name    = dto.Name;
        if (dto.Surname != null) user.Surname = dto.Surname;

        if (user.UserProfile != null)
        {
            if (dto.Address != null)      user.UserProfile.Address      = dto.Address;
            if (dto.WorkName != null)     user.UserProfile.WorkName     = dto.WorkName;
            if (dto.MonthlyIncome.HasValue)
            {
                if (dto.MonthlyIncome.Value < 100)
                    throw new BusinessException("INSUFFICIENT_INCOME", "Los ingresos mensuales deben ser al menos Q100.00");
                user.UserProfile.MonthlyIncome = dto.MonthlyIncome.Value;
            }
        }

        var updatedUser = await userRepository.UpdateUserAsync(user);
        return MapToUserResponseDto(updatedUser);
    }

    // ─── Login ────────────────────────────────────────────────────────────────
    public async Task<AuthResponseDto> LoginAsync(LoginDto loginDto)
    {
        User? user = null;

        if (loginDto.EmailOrUsername.Contains('@'))
            user = await userRepository.GetByEmailAsync(loginDto.EmailOrUsername.ToLowerInvariant());
        else
            user = await userRepository.GetByUsernameAsync(loginDto.EmailOrUsername);

        if (user == null)
        {
            logger.LogFailedLoginAttempt();
            throw new UnauthorizedAccessException("Invalid credentials");
        }

        if (!user.Status)
        {
            logger.LogFailedLoginAttempt();
            throw new UnauthorizedAccessException("User account is disabled");
        }

        if (user.UserEmail?.EmailVerified == false)
        {
            logger.LogFailedLoginAttempt();
            throw new UnauthorizedAccessException("Email no verificado. Por favor verifica tu correo antes de iniciar sesión");
        }

        if (!passwordHashService.VerifyPassword(loginDto.Password, user.Password))
        {
            logger.LogFailedLoginAttempt();
            throw new UnauthorizedAccessException("Invalid credentials");
        }

        logger.LogUserLoggedIn();

        var token = jwtTokenService.GenerateToken(user);
        var expiryMinutes = int.Parse(configuration["JwtSettings:ExpiryInMinutes"] ?? "30");

        return new AuthResponseDto
        {
            Success = true,
            Message = "Login exitoso",
            Token = token,
            UserDetails = MapToUserDetailsDto(user),
            ExpiresAt = DateTime.UtcNow.AddMinutes(expiryMinutes)
        };
    }

    public async Task<EmailResponseDto> VerifyEmailAsync(VerifyEmailDto verifyEmailDto)
    {
        var user = await userRepository.GetByEmailVerificationTokenAsync(verifyEmailDto.Token);
        if (user == null || user.UserEmail == null)
        {
            return new EmailResponseDto
            {
                Success = false,
                Message = "Token de verificación inválido"
            };
        }

        if (user.UserEmail.EmailVerificationTokenExpiry < DateTime.UtcNow)
        {
            return new EmailResponseDto
            {
                Success = false,
                Message = "El token de verificación ha expirado, solicita uno nuevo"
            };
        }

        user.UserEmail.EmailVerified = true;
        user.Status = true;
        user.UserEmail.EmailVerificationToken = null;
        user.UserEmail.EmailVerificationTokenExpiry = null;

        await userRepository.UpdateUserAsync(user);

        try
        {
            await emailService.SendWelcomeEmailAsync(user.Email, user.Username);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to send welcome email to {Email}", user.Email);
        }

        logger.LogInformation("Email verified successfully for user {Username}", user.Username);

        return new EmailResponseDto
        {
            Success = true,
            Message = "Email verificado exitosamente",
            Data = new { email = user.Email, verified = true }
        };
    }

    public async Task<EmailResponseDto> ResendVerificationEmailAsync(ResendVerificationDto resendDto)
    {
        var user = await userRepository.GetByEmailAsync(resendDto.Email);
        if (user == null || user.UserEmail == null)
        {
            return new EmailResponseDto
            {
                Success = false,
                Message = "Usuario no encontrado",
                Data = new { email = resendDto.Email, sent = false }
            };
        }

        if (user.UserEmail.EmailVerified)
        {
            return new EmailResponseDto
            {
                Success = false,
                Message = "El email ya ha sido verificado",
                Data = new { email = user.Email, verified = true }
            };
        }

        var newToken = TokenGenerator.GenerateEmailVerificationToken();
        user.UserEmail.EmailVerificationToken = newToken;
        user.UserEmail.EmailVerificationTokenExpiry = DateTime.UtcNow.AddHours(24);

        await userRepository.UpdateUserAsync(user);

        try
        {
            await emailService.SendEmailVerificationAsync(user.Email, user.Username, newToken);
            return new EmailResponseDto
            {
                Success = true,
                Message = "Email de verificación enviado exitosamente",
                Data = new { email = user.Email, sent = true }
            };
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to resend verification email to {Email}", user.Email);
            return new EmailResponseDto
            {
                Success = false,
                Message = "Error al enviar el email de verificación",
                Data = new { email = user.Email, sent = false }
            };
        }
    }

    public async Task<EmailResponseDto> ForgotPasswordAsync(ForgotPasswordDto forgotPasswordDto)
    {
        var user = await userRepository.GetByEmailAsync(forgotPasswordDto.Email);
        if (user == null)
        {
            return new EmailResponseDto
            {
                Success = true,
                Message = "Si el email existe, se ha enviado un enlace de recuperación",
                Data = new { email = forgotPasswordDto.Email, initiated = true }
            };
        }

        var resetToken = TokenGenerator.GeneratePasswordResetToken();

        if (user.UserPasswordReset == null)
        {
            user.UserPasswordReset = new UserPasswordReset
            {
                UserId = user.Id,
                PasswordResetToken = resetToken,
                PasswordResetTokenExpiry = DateTime.UtcNow.AddHours(1)
            };
        }
        else
        {
            user.UserPasswordReset.PasswordResetToken = resetToken;
            user.UserPasswordReset.PasswordResetTokenExpiry = DateTime.UtcNow.AddHours(1);
        }

        await userRepository.UpdateUserAsync(user);

        try
        {
            await emailService.SendPasswordResetAsync(user.Email, user.Username, resetToken);
            logger.LogInformation("Password reset email sent to {Email}", user.Email);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to send password reset email to {Email}", user.Email);
        }

        return new EmailResponseDto
        {
            Success = true,
            Message = "Si el email existe, se ha enviado un enlace de recuperación",
            Data = new { email = forgotPasswordDto.Email, initiated = true }
        };
    }

    public async Task<EmailResponseDto> ResetPasswordAsync(ResetPasswordDto resetPasswordDto)
    {
        var user = await userRepository.GetByPasswordResetTokenAsync(resetPasswordDto.Token);
        if (user == null || user.UserPasswordReset == null)
        {
            return new EmailResponseDto
            {
                Success = false,
                Message = "Token de reset inválido o expirado",
                Data = new { token = resetPasswordDto.Token, reset = false }
            };
        }

        if (user.UserPasswordReset.PasswordResetTokenExpiry < DateTime.UtcNow)
        {
            return new EmailResponseDto
            {
                Success = false,
                Message = "El token de reset ha expirado, solicita uno nuevo",
                Data = new { token = resetPasswordDto.Token, reset = false }
            };
        }

        user.Password = passwordHashService.HashPassword(resetPasswordDto.NewPassword);
        user.UserPasswordReset.PasswordResetToken = null;
        user.UserPasswordReset.PasswordResetTokenExpiry = null;

        await userRepository.UpdateUserAsync(user);

        logger.LogInformation("Password reset successfully for user {Username}", user.Username);

        return new EmailResponseDto
        {
            Success = true,
            Message = "Contraseña actualizada exitosamente",
            Data = new { email = user.Email, reset = true }
        };
    }

    public async Task<UserResponseDto?> GetUserByIdAsync(string userId)
    {
        try
        {
            var user = await userRepository.GetByIdAsync(userId);
            return MapToUserResponseDto(user);
        }
        catch
        {
            return null;
        }
    }

    // ─── Mappers ──────────────────────────────────────────────────────────────
    private UserResponseDto MapToUserResponseDto(User user)
    {
        var userRole = user.UserRoles.FirstOrDefault()?.Role?.Name ?? RoleConstants.USER_ROLE;
        return new UserResponseDto
        {
            Id             = user.Id,
            Name           = user.Name,
            Surname        = user.Surname,
            Username       = user.Username,
            Email          = user.Email,
            Phone          = user.UserProfile?.Phone        ?? string.Empty,
            DPI            = user.UserProfile?.DPI          ?? string.Empty,
            Address        = user.UserProfile?.Address      ?? string.Empty,
            WorkName       = user.UserProfile?.WorkName     ?? string.Empty,
            MonthlyIncome  = user.UserProfile?.MonthlyIncome ?? 0,
            Role           = userRole,
            Status         = user.Status,
            IsEmailVerified = user.UserEmail?.EmailVerified ?? false,
            CreatedAt      = user.CreatedAt,
            UpdatedAt      = user.UpdatedAt
        };
    }

    private UserDetailsDto MapToUserDetailsDto(User user)
    {
        return new UserDetailsDto
        {
            Id       = user.Id,
            Username = user.Username,
            Role     = user.UserRoles.FirstOrDefault()?.Role?.Name ?? RoleConstants.USER_ROLE
        };
    }
}