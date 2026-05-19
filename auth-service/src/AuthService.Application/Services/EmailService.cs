using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using AuthService.Application.Interfaces;

namespace AuthService.Application.Services;

public class EmailService(IConfiguration configuration, ILogger<EmailService> logger) : IEmailService
{
    public async Task SendEmailVerificationAsync(string email, string username, string token)
    {
        var subject = "Verifica tu dirección de correo electrónico";
        var verificationUrl = $"{configuration["AppSettings:FrontendUrl"]}/verify-email?token={token}";

        var body = $@"
            <h2>¡Bienvenido {username}!</h2>
            <p>Por favor, verifica tu dirección de correo electrónico haciendo clic en el enlace a continuación:</p>
            <a href='{verificationUrl}' style='background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>
                Verificar Correo Electrónico
            </a>
            <p>Si no puedes hacer clic en el enlace, copia y pega esta URL en tu navegador:</p>
            <p>{verificationUrl}</p>
            <p>Este enlace expirará en 24 horas.</p>
            <p>Si no creaste una cuenta, por favor ignora este correo.</p>
        ";

        await SendEmailAsync(email, subject, body);
    }

    public async Task SendPasswordResetAsync(string email, string username, string token)
    {
        var subject = "Restablece tu contraseña";
        var resetUrl = $"{configuration["AppSettings:FrontendUrl"]}/reset-password?token={token}";

        var body = $@"
            <h2>Solicitud de Restablecimiento de Contraseña</h2>
            <p>Hola {username},</p>
            <p>Solicitaste restablecer tu contraseña. Haz clic en el enlace a continuación para restablecerla:</p>
            <a href='{resetUrl}' style='background-color: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>
                Restablecer Contraseña
            </a>
            <p>Si no puedes hacer clic en el enlace, copia y pega esta URL en tu navegador:</p>
            <p>{resetUrl}</p>
            <p>Este enlace expirará en 1 hora.</p>
            <p>Si no solicitaste esto, por favor ignora este correo y tu contraseña permanecerá sin cambios.</p>
        ";

        await SendEmailAsync(email, subject, body);
    }

    public async Task SendClientCreatedAsync(string email, string username, string password)
    {
        var subject = "¡Tu cuenta en PaySmart ha sido creada!";
        var body = $@"
            <div style='font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:24px;background:#0B1830;color:#FFFFFF;border-radius:12px;'>
                <h2 style='color:#41D2F2;'>¡Bienvenido a PaySmart, {username}!</h2>
                <p>El administrador del banco ha creado tu cuenta exitosamente.</p>
                <p>Aquí están tus credenciales de acceso:</p>
                <div style='background:#162C5F;padding:16px;border-radius:8px;margin:16px 0;border:1px solid #41D2F2;'>
                    <p style='margin:4px 0;'><strong style='color:#41D2F2;'>Usuario:</strong> {username}</p>
                    <p style='margin:4px 0;'><strong style='color:#41D2F2;'>Contraseña temporal:</strong> {password}</p>
                </div>
                <p style='color:#FFE968;font-size:0.85em;'>Por seguridad, te recomendamos cambiar tu contraseña contactando al banco.</p>
                <p>Si tienes alguna pregunta, comunícate con el banco directamente.</p>
            </div>
        ";
        await SendEmailAsync(email, subject, body);
    }

    public async Task SendWelcomeEmailAsync(string email, string username)
    {
        var subject = "¡Bienvenido a PaySmart!";

        var body = $@"
            <h2>¡Bienvenido a PaySmart, {username}!</h2>
            <p>Tu cuenta ha sido verificada y activada exitosamente.</p>
            <p>Ahora puedes disfrutar de todas las funciones de nuestra plataforma.</p>
            <p>Si tienes alguna pregunta, no dudes en contactar a nuestro equipo de soporte.</p>
            <p>¡Gracias por unirte a nosotros!</p>
        ";

        await SendEmailAsync(email, subject, body);
    }

    private async Task SendEmailAsync(string to, string subject, string body)
    {
        var smtpSettings = configuration.GetSection("SmtpSettings");

        try
        {
            // Verificar si el email está habilitado
            var enabled = bool.Parse(smtpSettings["Enabled"] ?? "true");
            if (!enabled)
            {
                logger.LogInformation("El envío de emails está deshabilitado en la configuración. Omitiendo envío");
                return;
            }

            // Validar configuración
            var host = smtpSettings["Host"];
            var portString = smtpSettings["Port"];
            var username = smtpSettings["Username"];
            var password = smtpSettings["Password"];
            var fromEmail = smtpSettings["FromEmail"];
            var fromName = smtpSettings["FromName"];

            if (string.IsNullOrEmpty(host) || string.IsNullOrEmpty(username) || string.IsNullOrEmpty(password))
            {
                logger.LogError("La configuración SMTP no está configurada correctamente");
                throw new InvalidOperationException("La configuración SMTP no está configurada correctamente");
            }

            // Avoid logging sensitive SMTP details

            var port = int.Parse(portString ?? "587");

            using var client = new SmtpClient();

            // Configurar timeout
            var timeoutMs = int.Parse(smtpSettings["Timeout"] ?? "30000");
            client.Timeout = timeoutMs;

            try
            {
                // Configurar validación de certificados SSL
                var ignoreCertErrors = bool.Parse(smtpSettings["IgnoreCertificateErrors"] ?? "false");
                if (ignoreCertErrors)
                {
                    logger.LogWarning("Validación de certificados SSL deshabilitada. Solo usar en desarrollo.");
                    client.ServerCertificateValidationCallback = (s, c, h, e) => true;
                }
                
                // Verificar configuración de SSL implícito
                var useImplicitSsl = bool.Parse(smtpSettings["UseImplicitSsl"] ?? "false");

                // Configuración específica por puerto y SSL
                if (useImplicitSsl || port == 465)
                {
                    await client.ConnectAsync(host, port, SecureSocketOptions.SslOnConnect);
                }
                else if (port == 587)
                {
                    await client.ConnectAsync(host, port, SecureSocketOptions.StartTls);
                }
                else
                {
                    await client.ConnectAsync(host, port, SecureSocketOptions.Auto);
                }

                // Autenticación
                await client.AuthenticateAsync(username, password);

                // Crear mensaje con MimeKit
                var message = new MimeMessage();
                message.From.Add(new MailboxAddress(fromName, fromEmail));
                message.To.Add(new MailboxAddress("", to));
                message.Subject = subject;
                message.Body = new TextPart("html") { Text = body };

                // Enviar
                await client.SendAsync(message);
                logger.LogInformation("Email enviado exitosamente");

                await client.DisconnectAsync(true);
                logger.LogInformation("Pipeline de email completado");
            }
            catch (MailKit.Security.AuthenticationException authEx)
            {
                logger.LogError(authEx, "La autenticación de Gmail falló. Verifica la contraseña de aplicación.");
                throw new InvalidOperationException($"La autenticación de Gmail falló: {authEx.Message}. Por favor, verifica la contraseña de aplicación.", authEx);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error al enviar el email");
                throw;
            }
            logger.LogInformation("Email processed");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error al enviar el email");

            // Verificar si usar fallback
            var useFallback = bool.Parse(smtpSettings["UseFallback"] ?? "false");
            if (useFallback)
            {
                logger.LogWarning("Usando respaldo de email");
                return; // No fallar, solo logear
            }

            throw new InvalidOperationException($"Error al enviar el email: {ex.Message}", ex);
        }
    }
}
