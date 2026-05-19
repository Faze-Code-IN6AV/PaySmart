using System;
using System.ComponentModel.DataAnnotations;

namespace AuthService.Domain.Entities;

public class User
{
    [Key]
    [MaxLength(16)]
    public string Id {get; set;} = string.Empty;

    [Required(ErrorMessage = "El nombre es obligatorio")]
    [MaxLength(25, ErrorMessage = "El nombre no debe de tener mas de 25 caracteres")]
    public string Name {get; set;} = string.Empty;

    [Required(ErrorMessage = "El apellido es obligatorio")]
    [MaxLength(25, ErrorMessage = "El apellido no debe de tener mas de 25 caracteres")]
    public string Surname {get; set;} = string.Empty;

    [Required(ErrorMessage = "El username es obligatorio")]
    [MaxLength(25, ErrorMessage = "El username no debe de tener mas de 25 caracteres")]
    public string Username {get; set;} = string.Empty;

    [Required(ErrorMessage = "El email es obligatorio")]
    [MaxLength(150, ErrorMessage = "El email no debe de tener mas de 25 caracteres")]
    [EmailAddress(ErrorMessage = "El formato del email no es valido")]
    public string Email {get; set;} = string.Empty;

    [Required(ErrorMessage = "La contraseña es obligatorio")]
    [MaxLength(25, ErrorMessage = "La contraseña no debe de tener mas de 25 caracteres")]
    [MinLength(8, ErrorMessage = "La contraseña debe de tener almenos 8 caracteres")]
    public string Password {get; set;} = string.Empty;

    public bool Status {get; set;} = false;

    /// <summary>
    /// Borrado lógico. Nunca se eliminan registros físicamente de la BD
    /// por razones legales y de auditoría bancaria.
    /// </summary>
    public bool IsDeleted { get; set; } = false;

    /// <summary>
    /// Fecha en que se realizó el borrado lógico. Null si el usuario está activo.
    /// </summary>
    public DateTime? DeletedAt { get; set; } = null;

    public DateTime CreatedAt {get; set;} = DateTime.UtcNow;

    public DateTime UpdatedAt {get; set;} = DateTime.UtcNow;

    public UserProfile UserProfile {get; set;} = null!;

    public ICollection<UserRole> UserRoles {get; set;} = [];

    public UserEmail UserEmail {get; set;} = null!;

    public UserPasswordReset UserPasswordReset {get; set;} = null!;
}