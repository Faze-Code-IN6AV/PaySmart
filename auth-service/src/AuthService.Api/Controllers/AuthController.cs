using AuthService.Application.DTOs;
using AuthService.Application.DTOs.Email;
using AuthService.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace AuthService.Api.Controllers;

/// <summary>
/// Endpoints de autenticación: registro, login, verificación de email y recuperación de contraseña.
/// </summary>
[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
[Tags("Auth")]
public class AuthController(IAuthService authService) : ControllerBase
{
    /// <summary>
    /// Registrar un nuevo usuario en el sistema.
    /// </summary>
    /// <remarks>Acepta multipart/form-data. Envía un email de verificación automáticamente tras el registro exitoso.</remarks>
    /// <param name="registerDto">Datos del nuevo usuario (nombre, apellido, username, email, password, teléfono).</param>
    /// <response code="201">Usuario registrado exitosamente. Se enviará un email de verificación.</response>
    /// <response code="400">Datos inválidos o el usuario ya existe.</response>
    [HttpPost("register")]
    [RequestSizeLimit(10 * 1024 * 1024)]
    [EnableRateLimiting("AuthPolicy")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(RegisterResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<RegisterResponseDto>> Register([FromForm] RegisterDto registerDto)
    {
        var result = await authService.RegisterAsync(registerDto);
        return StatusCode(201, result);
    }

    /// <summary>
    /// Reenviar el email de verificación de cuenta.
    /// </summary>
    /// <param name="resendDto">Email del usuario al que reenviar la verificación.</param>
    /// <response code="200">Email de verificación reenviado exitosamente.</response>
    /// <response code="400">El email ya fue verificado.</response>
    /// <response code="404">No existe un usuario con ese email.</response>
    /// <response code="503">Error al enviar el email (problema con el servicio de correo).</response>
    [HttpPost("resend-verification")]
    [EnableRateLimiting("AuthPolicy")]
    [ProducesResponseType(typeof(EmailResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status503ServiceUnavailable)]
    public async Task<ActionResult<EmailResponseDto>> ResendVerification([FromBody] ResendVerificationDto resendDto)
    {
        var result = await authService.ResendVerificationEmailAsync(resendDto);

        if (!result.Success)
        {
            if (result.Message.Contains("no encontrado", StringComparison.OrdinalIgnoreCase))
                return NotFound(result);

            if (result.Message.Contains("ya ha sido verificado", StringComparison.OrdinalIgnoreCase))
                return BadRequest(result);

            return StatusCode(503, result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Verificar el email del usuario usando el token recibido por correo.
    /// </summary>
    /// <param name="verifyEmailDto">Token de verificación enviado al email del usuario.</param>
    /// <response code="200">Email verificado exitosamente.</response>
    /// <response code="400">Token inválido o expirado.</response>
    [HttpPost("verify-email")]
    [EnableRateLimiting("AuthPolicy")]
    [ProducesResponseType(typeof(EmailResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<EmailResponseDto>> VerifyEmail([FromBody] VerifyEmailDto verifyEmailDto)
    {
        var result = await authService.VerifyEmailAsync(verifyEmailDto);
        return Ok(result);
    }

    /// <summary>
    /// Iniciar sesión con email o username y contraseña.
    /// </summary>
    /// <param name="loginDto">Credenciales: emailOrUsername y password.</param>
    /// <response code="200">Login exitoso. Retorna JWT token y detalles del usuario.</response>
    /// <response code="400">Credenciales inválidas o campos faltantes.</response>
    /// <response code="401">Email no verificado o usuario inactivo.</response>
    [HttpPost("login")]
    [EnableRateLimiting("AuthPolicy")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginDto loginDto)
    {
        var result = await authService.LoginAsync(loginDto);
        return Ok(result);
    }

    /// <summary>
    /// Solicitar recuperación de contraseña. Envía un email con el enlace/token de reset.
    /// </summary>
    /// <param name="forgotPasswordDto">Email registrado del usuario que olvidó su contraseña.</param>
    /// <response code="200">Email de recuperación enviado exitosamente.</response>
    /// <response code="503">Error al enviar el email (problema con el servicio de correo).</response>
    [HttpPost("forgot-password")]
    [EnableRateLimiting("AuthPolicy")]
    [ProducesResponseType(typeof(EmailResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status503ServiceUnavailable)]
    public async Task<ActionResult<EmailResponseDto>> ForgotPassword([FromBody] ForgotPasswordDto forgotPasswordDto)
    {
        var result = await authService.ForgotPasswordAsync(forgotPasswordDto);
        return Ok(result);
    }

    /// <summary>
    /// Restablecer la contraseña usando el token de recuperación recibido por email.
    /// </summary>
    /// <param name="resetPasswordDto">Token de reset y la nueva contraseña (mínimo 8 caracteres).</param>
    /// <response code="200">Contraseña restablecida exitosamente.</response>
    /// <response code="400">Token inválido, expirado o nueva contraseña no válida.</response>
    [HttpPost("reset-password")]
    [EnableRateLimiting("AuthPolicy")]
    [ProducesResponseType(typeof(EmailResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<EmailResponseDto>> ResetPassword([FromBody] ResetPasswordDto resetPasswordDto)
    {
        var result = await authService.ResetPasswordAsync(resetPasswordDto);
        return Ok(result);
    }

    /// <summary>
    /// Obtener el perfil del usuario autenticado.
    /// </summary>
    /// <remarks>Requiere JWT válido en el header Authorization. Extrae el userId del token.</remarks>
    /// <response code="200">Perfil obtenido exitosamente.</response>
    /// <response code="401">Token no proporcionado o inválido.</response>
    /// <response code="404">Usuario no encontrado.</response>
    [HttpGet("profile")]
    [Authorize]
    [ProducesResponseType(typeof(UserResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<object>> GetProfile()
    {
        var userId = User.Claims
            .FirstOrDefault(c => c.Type == "sub" ||
                c.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;

        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { success = false, message = "Token inválido" });

        var user = await authService.GetUserByIdAsync(userId);

        if (user == null)
            return NotFound(new { success = false, message = "Usuario no encontrado" });

        return Ok(new { success = true, message = "Perfil obtenido exitosamente", data = user });
    }

    /// <summary>
    /// Obtener el perfil de un usuario por su ID (uso interno entre microservicios).
    /// </summary>
    /// <param name="request">Objeto con el userId a consultar.</param>
    /// <response code="200">Perfil obtenido exitosamente.</response>
    /// <response code="400">El userId es requerido.</response>
    /// <response code="404">Usuario no encontrado.</response>
    [HttpPost("profile/by-id")]
    [EnableRateLimiting("ApiPolicy")]
    [ProducesResponseType(typeof(UserResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<object>> GetProfileById([FromBody] GetProfileByIdDto request)
    {
        var user = await authService.GetUserByIdAsync(request.UserId);

        if (user == null)
            return NotFound(new { success = false, message = "Usuario no encontrado" });

        return Ok(new { success = true, message = "Perfil obtenido exitosamente", data = user });
    }
}