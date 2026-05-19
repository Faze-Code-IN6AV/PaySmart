using System.ComponentModel.DataAnnotations;

namespace AuthService.Application.DTOs;

/// <summary>
/// DTO para que el Administrador edite datos de un cliente.
/// El admin NO puede modificar DPI ni contraseña del cliente.
/// </summary>
public class UpdateClientProfileDto
{
    [MaxLength(25)]
    public string? Name { get; set; }

    [MaxLength(25)]
    public string? Surname { get; set; }

    [MaxLength(250)]
    public string? Address { get; set; }

    [MaxLength(100)]
    public string? WorkName { get; set; }

    [Range(100, double.MaxValue, ErrorMessage = "Los ingresos mensuales deben ser al menos Q100.00")]
    public decimal? MonthlyIncome { get; set; }

    [StringLength(8, MinimumLength = 8, ErrorMessage = "El teléfono debe tener exactamente 8 dígitos")]
    [RegularExpression(@"^\d{8}$", ErrorMessage = "El teléfono debe contener solo números")]
    public string? Phone { get; set; }
}
