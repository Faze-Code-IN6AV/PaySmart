using AuthService.Api.Extensions;
using AuthService.persistence.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddApplicationServices(builder.Configuration);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

    try
    {
        logger.LogInformation("Verificando conexión a la base de datos...");

        // Garantizar que la base de datos se crea (similar a Sequelize sync en Node.js)
        await context.Database.EnsureCreatedAsync();

        logger.LogInformation("Base de datos lista. Ejecutando datos semilla...");
        await DataSeeder.SeedAsync(context);

        logger.LogInformation("Inicialización de base de datos completada exitosamente");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Ocurrió un error al inicializar la base de datos");
        throw; // Relanzar para detener la aplicación
    }
}

app.Run();
