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

    [MaxLength(250)]
    public string ProfilePicture {get; set;} = string.Empty;

    [Required]
    [StringLength(8, MinimumLength =8, ErrorMessage = "El numero de telefono debe de tener exactamente 8 caracteres")]
    [RegularExpression(@"^\d{8}$", ErrorMessage = "El numeo de telefono debe de contener solo numeros")]
    public string Phone {get; set;} = string.Empty;

    public DateTime CreatedAt = DateTime.UtcNow;

    public DateTime UpdatedAt = DateTime.UtcNow;

    public User User {get; set;} = null!;


}
