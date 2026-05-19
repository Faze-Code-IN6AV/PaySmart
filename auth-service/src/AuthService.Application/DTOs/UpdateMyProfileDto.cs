using System.ComponentModel.DataAnnotations;

namespace AuthService.Application.DTOs;

/// <summary>
/// DTO para que el propio cliente edite su perfil.
/// Solo puede editar: nombre, dirección, nombre de trabajo, ingresos mensuales.
/// NO puede editar: username, email, DPI, contraseña ni rol.
/// </summary>
public class UpdateMyProfileDto
{
    [MaxLength(25, ErrorMessage = "El nombre no puede exceder 25 caracteres")]
    public string? Name { get; set; }

    [MaxLength(25, ErrorMessage = "El apellido no puede exceder 25 caracteres")]
    public string? Surname { get; set; }

    [MaxLength(250, ErrorMessage = "La dirección no puede exceder 250 caracteres")]
    public string? Address { get; set; }

    [MaxLength(100, ErrorMessage = "El nombre de trabajo no puede exceder 100 caracteres")]
    public string? WorkName { get; set; }

    [Range(100, double.MaxValue, ErrorMessage = "Los ingresos mensuales deben ser al menos Q100.00")]
    public decimal? MonthlyIncome { get; set; }
}
