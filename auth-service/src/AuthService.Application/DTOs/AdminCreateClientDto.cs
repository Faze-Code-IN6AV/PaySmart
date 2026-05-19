using System.ComponentModel.DataAnnotations;

namespace AuthService.Application.DTOs;

/// <summary>
/// DTO exclusivo para que el Administrador cree un nuevo cliente.
/// El cliente nunca puede auto-registrarse; solo el admin puede crearlo.
/// </summary>
public class AdminCreateClientDto
{
    [Required(ErrorMessage = "El nombre es obligatorio")]
    [MaxLength(25)]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "El apellido es obligatorio")]
    [MaxLength(25)]
    public string Surname { get; set; } = string.Empty;

    [Required(ErrorMessage = "El username es obligatorio")]
    [MinLength(3)]
    [MaxLength(25)]
    [RegularExpression(@"^[a-zA-Z0-9_]+$", ErrorMessage = "Solo letras, números y guión bajo")]
    public string Username { get; set; } = string.Empty;

    [Required(ErrorMessage = "El email es obligatorio")]
    [EmailAddress(ErrorMessage = "Formato de email inválido")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "La contraseña es obligatoria")]
    [MinLength(8, ErrorMessage = "La contraseña debe tener al menos 8 caracteres")]
    public string Password { get; set; } = string.Empty;

    [Required(ErrorMessage = "El teléfono es obligatorio")]
    [StringLength(8, MinimumLength = 8, ErrorMessage = "El teléfono debe tener exactamente 8 dígitos")]
    [RegularExpression(@"^\d{8}$", ErrorMessage = "El teléfono debe contener solo números")]
    public string Phone { get; set; } = string.Empty;

    [Required(ErrorMessage = "El DPI es obligatorio")]
    [StringLength(13, MinimumLength = 13, ErrorMessage = "El DPI debe tener exactamente 13 dígitos")]
    [RegularExpression(@"^\d{13}$", ErrorMessage = "El DPI debe contener solo números")]
    public string DPI { get; set; } = string.Empty;

    [Required(ErrorMessage = "La dirección es obligatoria")]
    [MaxLength(250)]
    public string Address { get; set; } = string.Empty;

    [Required(ErrorMessage = "El nombre de trabajo es obligatorio")]
    [MaxLength(100)]
    public string WorkName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Los ingresos mensuales son obligatorios")]
    [Range(100, double.MaxValue, ErrorMessage = "Los ingresos mensuales deben ser al menos Q100.00 para crear la cuenta")]
    public decimal MonthlyIncome { get; set; }
}
