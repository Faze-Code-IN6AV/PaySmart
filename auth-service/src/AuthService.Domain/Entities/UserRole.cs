using System;
using System.ComponentModel.DataAnnotations;

namespace AuthService.Domain.Entities;

public class UserRole
{
    [Key]
    [MaxLength(16)]
    public string Id {get; set;} = string.Empty;

    [Required]
    [MaxLength(16)]
    public string UserId {get; set;} = string.Empty;

    [Required]
    [MaxLength(16)]
    public string RoleId {get; set;} = string.Empty;

    public DateTime CreatedAt = DateTime.UtcNow;

    public DateTime UpdatedAt = DateTime.UtcNow;

    [Required]
    public User User {get; set;} = null!;

    [Required]
    public Role Role {get; set;} = null!;
    
}
