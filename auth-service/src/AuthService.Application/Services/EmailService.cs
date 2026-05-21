using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using AuthService.Application.Interfaces;

namespace AuthService.Application.Services;

public class EmailService(IConfiguration configuration, ILogger<EmailService> logger) : IEmailService
{
    // ─── Layout base compartido ────────────────────────────────────────────────
    private static string Wrap(string headerAccent, string headerTitle, string headerSubtitle, string bodyContent) => $@"
<!DOCTYPE html>
<html lang='es'>
<head>
  <meta charset='UTF-8'/>
  <meta name='viewport' content='width=device-width,initial-scale=1'/>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&family=Open+Sans:wght@400;600&display=swap');
    body {{ margin:0; padding:0; background:#F0F4F8; font-family:'Open Sans',Arial,sans-serif; }}
    .wrapper {{ max-width:620px; margin:32px auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,.12); }}
    /* ── Header ── */
    .header {{ background:linear-gradient(135deg,#0B1830 0%,#162C5F 100%); padding:0; }}
    .header-top {{ width:100%; border-collapse:collapse; }}
    .header-top td {{ padding:24px 32px 0; vertical-align:middle; }}
    .header-top .td-badge {{ text-align:right; white-space:nowrap; width:1%; }}
    .brand {{ font-family:'Montserrat',sans-serif; font-size:22px; font-weight:800; color:#ffffff; letter-spacing:-0.5px; }}
    .brand span {{ color:{headerAccent}; }}
    .badge {{ background:{headerAccent}; color:#0B1830; font-family:'Montserrat',sans-serif; font-size:11px; font-weight:700; padding:4px 10px; border-radius:20px; letter-spacing:.5px; }}
    .header-body {{ padding:0 32px 26px; }}
    .header-title {{ font-family:'Montserrat',sans-serif; font-size:26px; font-weight:800; color:#ffffff; margin:0 0 6px; line-height:1.2; }}
    .header-sub {{ font-size:13px; color:rgba(255,255,255,.65); margin:0; }}
    .accent-bar {{ height:4px; background:linear-gradient(90deg,{headerAccent} 0%,transparent 100%); }}
    /* ── Body ── */
    .body {{ padding:36px 32px; }}
    .greeting {{ font-size:15px; color:#1a2a4a; font-weight:600; margin:0 0 16px; }}
    .text {{ font-size:14px; color:#3d5068; line-height:1.7; margin:0 0 16px; }}
    /* ── Caja de credenciales ── */
    .cred-box {{ background:#F7F9FC; border:1px solid #D4E0EE; border-left:4px solid {headerAccent}; border-radius:8px; padding:20px 24px; margin:24px 0; }}
    .cred-row {{ display:flex; align-items:center; padding:8px 0; border-bottom:1px solid #E4EAF2; }}
    .cred-row:last-child {{ border-bottom:none; }}
    .cred-label {{ font-size:12px; font-weight:600; color:#6B84A0; text-transform:uppercase; letter-spacing:.6px; width:160px; flex-shrink:0; }}
    .cred-value {{ font-size:14px; font-weight:600; color:#1a2a4a; font-family:'Courier New',monospace; }}
    /* ── CTA Button ── */
    .btn-wrap {{ text-align:center; margin:28px 0 8px; }}
    .btn {{ display:inline-block; background:linear-gradient(135deg,#0B1830,#162C5F); color:#ffffff !important; font-family:'Montserrat',sans-serif; font-size:14px; font-weight:700; padding:14px 36px; border-radius:8px; text-decoration:none; letter-spacing:.3px; }}
    .btn-accent {{ background:linear-gradient(135deg,{headerAccent},{headerAccent}cc); color:#0B1830 !important; }}
    .url-box {{ background:#F0F4F8; border-radius:6px; padding:10px 14px; font-size:12px; color:#4a6280; word-break:break-all; margin:12px 0 0; }}
    /* ── Warning ── */
    .warning {{ background:#FFFBEA; border:1px solid #FFE968; border-radius:8px; padding:14px 18px; margin:20px 0; font-size:13px; color:#7A6200; }}
    .warning strong {{ color:#5a4800; }}
    /* ── Footer ── */
    .footer {{ background:#F7F9FC; border-top:1px solid #E4EAF2; padding:20px 32px; text-align:center; }}
    .footer p {{ font-size:11px; color:#8DA4BE; margin:4px 0; line-height:1.6; }}
  </style>
</head>
<body>
<div class='wrapper'>
  <div class='header'>
    <table class='header-top'><tr>
      <td><div class='brand'>Pay<span>Smart</span></div></td>
      <td class='td-badge'><div class='badge'>BANCA DIGITAL</div></td>
    </tr></table>
    <div class='header-body'>
      <p class='header-title'>{headerTitle}</p>
      <p class='header-sub'>{headerSubtitle}</p>
    </div>
  </div>
  <div class='accent-bar'></div>
  <div class='body'>
    {bodyContent}
  </div>
  <div class='footer'>
    <p>Este correo fue enviado automáticamente por <strong>PaySmart Banca Digital</strong>. Por favor no respondas a este mensaje.</p>
    <p>© 2026 PaySmart · Todos los derechos reservados</p>
  </div>
</div>
</body>
</html>";

    // ─── Verificación de correo ────────────────────────────────────────────────
    public async Task SendEmailVerificationAsync(string email, string username, string token)
    {
        var subject = "Verifica tu dirección de correo — PaySmart";
        var verificationUrl = $"{configuration["AppSettings:FrontendUrl"]}/verify-email?token={token}";

        var body = Wrap(
            headerAccent: "#41D2F2",
            headerTitle: "Verifica tu correo electrónico",
            headerSubtitle: "Centro de Verificación de Identidad · PaySmart",
            bodyContent: $@"
                <p class='greeting'>Estimado(a) {username}:</p>
                <p class='text'>
                    Recibe un cordial saludo de parte de <strong>PaySmart Banca Digital</strong>.
                    Para activar tu cuenta y comenzar a disfrutar de nuestros servicios, es indispensable
                    que verifiques tu dirección de correo electrónico haciendo clic en el botón a continuación.
                </p>
                <p class='text'>Tendrás como límite <strong>24 horas</strong> desde la recepción de este mensaje para completar este paso.</p>
                <div class='btn-wrap'>
                    <a href='{verificationUrl}' class='btn'>Verificar Correo Electrónico</a>
                </div>
                <p class='text' style='text-align:center;font-size:12px;color:#6B84A0;'>Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:</p>
                <div class='url-box'>{verificationUrl}</div>
                <div class='warning'>
                    <strong>¿No creaste una cuenta?</strong> Si no reconoces esta solicitud, por favor ignora este correo. Tu información permanecerá segura.
                </div>
            "
        );

        await SendEmailAsync(email, subject, body);
    }

    // ─── Restablecimiento de contraseña ───────────────────────────────────────
    public async Task SendPasswordResetAsync(string email, string username, string token)
    {
        var subject = "Solicitud de restablecimiento de contraseña — PaySmart";
        var resetUrl = $"{configuration["AppSettings:FrontendUrl"]}/reset-password?token={token}";

        var body = Wrap(
            headerAccent: "#FFE968",
            headerTitle: "Restablecimiento de contraseña",
            headerSubtitle: "Seguridad de Cuenta · PaySmart",
            bodyContent: $@"
                <p class='greeting'>Estimado(a) {username}:</p>
                <p class='text'>
                    Hemos recibido una solicitud para restablecer la contraseña asociada a tu cuenta en
                    <strong>PaySmart Banca Digital</strong>. Si fuiste tú quien realizó esta solicitud,
                    haz clic en el botón a continuación para continuar.
                </p>
                <p class='text'>Este enlace expirará en <strong>1 hora</strong> por razones de seguridad.</p>
                <div class='btn-wrap'>
                    <a href='{resetUrl}' class='btn btn-accent'>Restablecer Contraseña</a>
                </div>
                <p class='text' style='text-align:center;font-size:12px;color:#6B84A0;'>Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:</p>
                <div class='url-box'>{resetUrl}</div>
                <div class='warning'>
                    <strong>¿No solicitaste esto?</strong> Si no reconoces esta acción, ignora este correo. Tu contraseña permanecerá sin cambios y tu cuenta seguirá segura.
                </div>
            "
        );

        await SendEmailAsync(email, subject, body);
    }

    // ─── Cuenta creada por administrador ──────────────────────────────────────
    public async Task SendClientCreatedAsync(string email, string username, string password)
    {
        var subject = "Credenciales de acceso a tu cuenta — PaySmart";

        var body = Wrap(
            headerAccent: "#41D2F2",
            headerTitle: "Acceso al Portal de Clientes",
            headerSubtitle: "Centro de Atención y Servicios Bancarios · PaySmart",
            bodyContent: $@"
                <p class='greeting'>Estimado(a) {username}:</p>
                <p class='text'>
                    Recibe un cordial saludo de parte de <strong>PaySmart Banca Digital</strong>.
                    Un administrador ha creado tu cuenta exitosamente. A continuación encontrarás
                    tus credenciales de acceso al portal de clientes.
                </p>
                <div class='cred-box'>
                    <div class='cred-row'>
                        <span class='cred-label'>Usuario</span>
                        <span class='cred-value'>{username}</span>
                    </div>
                    <div class='cred-row'>
                        <span class='cred-label'>Contraseña temporal</span>
                        <span class='cred-value'>{password}</span>
                    </div>
                </div>
                <p class='text'>
                    Ingresa al portal con las credenciales anteriores. Por seguridad, te recomendamos
                    actualizar tu contraseña al iniciar sesión por primera vez.
                </p>
                <div class='warning'>
                    <strong>Aviso de seguridad:</strong> Nunca compartas tus credenciales con nadie. PaySmart jamás te solicitará tu contraseña por ningún medio.
                </div>
            "
        );

        await SendEmailAsync(email, subject, body);
    }

    // ─── Bienvenida tras verificación ─────────────────────────────────────────
    public async Task SendWelcomeEmailAsync(string email, string username)
    {
        var subject = "¡Tu cuenta ha sido activada! — PaySmart";

        var body = Wrap(
            headerAccent: "#41D2F2",
            headerTitle: "¡Bienvenido a PaySmart!",
            headerSubtitle: "Tu cuenta ha sido verificada y activada exitosamente",
            bodyContent: $@"
                <p class='greeting'>Estimado(a) {username}:</p>
                <p class='text'>
                    Es un placer darte la bienvenida a <strong>PaySmart Banca Digital</strong>.
                    Tu cuenta ha sido verificada y activada exitosamente. A partir de ahora puedes
                    acceder a todos los servicios de nuestra plataforma.
                </p>
                <div class='cred-box'>
                    <div class='cred-row'>
                        <span class='cred-label'>Estado de cuenta</span>
                        <span class='cred-value' style='color:#22c55e;'>✓ Activa y verificada</span>
                    </div>
                    <div class='cred-row'>
                        <span class='cred-label'>Acceso disponible</span>
                        <span class='cred-value'>Portal de Clientes PaySmart</span>
                    </div>
                </div>
                <p class='text'>
                    Si tienes alguna pregunta o necesitas asistencia, no dudes en comunicarte
                    con nuestro equipo de atención al cliente. Estamos para servirte.
                </p>
                <p class='text'>¡Gracias por confiar en PaySmart!</p>
            "
        );

        await SendEmailAsync(email, subject, body);
    }

    // ─── Envío SMTP ───────────────────────────────────────────────────────────
    private async Task SendEmailAsync(string to, string subject, string body)
    {
        var smtpSettings = configuration.GetSection("SmtpSettings");

        try
        {
            var enabled = bool.Parse(smtpSettings["Enabled"] ?? "true");
            if (!enabled)
            {
                logger.LogInformation("El envío de emails está deshabilitado en la configuración. Omitiendo envío");
                return;
            }

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

            var port = int.Parse(portString ?? "587");

            using var client = new SmtpClient();

            var timeoutMs = int.Parse(smtpSettings["Timeout"] ?? "30000");
            client.Timeout = timeoutMs;

            try
            {
                var ignoreCertErrors = bool.Parse(smtpSettings["IgnoreCertificateErrors"] ?? "false");
                if (ignoreCertErrors)
                {
                    logger.LogWarning("Validación de certificados SSL deshabilitada. Solo usar en desarrollo.");
                    client.ServerCertificateValidationCallback = (s, c, h, e) => true;
                }

                var useImplicitSsl = bool.Parse(smtpSettings["UseImplicitSsl"] ?? "false");

                if (useImplicitSsl || port == 465)
                    await client.ConnectAsync(host, port, SecureSocketOptions.SslOnConnect);
                else if (port == 587)
                    await client.ConnectAsync(host, port, SecureSocketOptions.StartTls);
                else
                    await client.ConnectAsync(host, port, SecureSocketOptions.Auto);

                await client.AuthenticateAsync(username, password);

                var message = new MimeMessage();
                message.From.Add(new MailboxAddress(fromName, fromEmail));
                message.To.Add(new MailboxAddress("", to));
                message.Subject = subject;
                message.Body = new TextPart("html") { Text = body };

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

            var useFallback = bool.Parse(smtpSettings["UseFallback"] ?? "false");
            if (useFallback)
            {
                logger.LogWarning("Usando respaldo de email");
                return;
            }

            throw new InvalidOperationException($"Error al enviar el email: {ex.Message}", ex);
        }
    }
}