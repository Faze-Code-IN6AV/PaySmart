using System;
using System.ComponentModel.DataAnnotations;

namespace AuthService.Domain.Entities;

public class Role
{
    [Key]
    [MaxLength(16)]
    public string Id {get; set;} = string.Empty;

    [Required(ErrorMessage = "El nombre del rol es obligatorio")]
    [MaxLength(25, ErrorMessage = "El nombre del rol no debe de tener mas de 25 caracteres")]
    public string Name {get; set;} = string.Empty;

    public DateTime CreatedAt {get; set;} = DateTime.UtcNow;

    public DateTime UpdatedAt {get; set;} = DateTime.UtcNow;

    public ICollection<UserRole> UserRoles {get; set;} = [];
}
