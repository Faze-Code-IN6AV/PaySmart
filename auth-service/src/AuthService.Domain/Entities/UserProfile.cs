using System;
using System.ComponentModel.DataAnnotations;

namespace AuthService.Domain.Entities;

public class UserProfile
{
    [Key]
    [MaxLength(16)]
    public string Id {get; set;} = string.Empty;

    [Required(ErrorMessage = "El ID del usuario es obligatorio")]
    [MaxLength(16)]
    public string UserId {get; set;} = string.Empty;

    [Required(ErrorMessage = "El número de teléfono es obligatorio")]
    [StringLength(8, MinimumLength = 8, ErrorMessage = "El número de teléfono debe tener exactamente 8 caracteres")]
    [RegularExpression(@"^\d{8}$", ErrorMessage = "El número de teléfono debe contener solo números")]
    public string Phone {get; set;} = string.Empty;

    [Required(ErrorMessage = "El DPI es obligatorio")]
    [StringLength(13, MinimumLength = 13, ErrorMessage = "El DPI debe tener exactamente 13 dígitos")]
    [RegularExpression(@"^\d{13}$", ErrorMessage = "El DPI debe contener solo números")]
    public string DPI {get; set;} = string.Empty;

    [Required(ErrorMessage = "La dirección es obligatoria")]
    [MaxLength(250, ErrorMessage = "La dirección no puede exceder 250 caracteres")]
    public string Address {get; set;} = string.Empty;

    [Required(ErrorMessage = "El nombre de trabajo es obligatorio")]
    [MaxLength(100, ErrorMessage = "El nombre de trabajo no puede exceder 100 caracteres")]
    public string WorkName {get; set;} = string.Empty;

    [Required(ErrorMessage = "Los ingresos mensuales son obligatorios")]
    public decimal MonthlyIncome {get; set;} = 0;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public User User {get; set;} = null!;
}
