using Microsoft.AspNetCore.Mvc;

namespace AuthService.Api.Controllers;

/// <summary>
/// Endpoint de salud del servicio.
/// </summary>
[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
[Tags("Health")]
public class HealthController : ControllerBase
{
    /// <summary>
    /// Verificar que el servicio está en línea y funcionando correctamente.
    /// </summary>
    /// <response code="200">Servicio saludable.</response>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public IActionResult GetHealth()
    {
        var response = new
        {
            status = "Healthy",
            timestamp = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
            service = "PaySmart Auth Service"
        };
        return Ok(response);
    }
}