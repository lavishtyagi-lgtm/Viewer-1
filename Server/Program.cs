 using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Register Controller support
builder.Services.AddControllers();

// Swagger/OpenAPI support
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// APS Singleton registration (get secrets from configuration)
var config = builder.Configuration;
var clientID = config["APS_CLIENT_ID"];
var clientSecret = config["APS_CLIENT_SECRET"];
var bucket = config["APS_BUCKET"]; // Optional

if (string.IsNullOrEmpty(clientID) || string.IsNullOrEmpty(clientSecret))
    throw new ApplicationException("Missing required environment variables APS_CLIENT_ID or APS_CLIENT_SECRET.");

builder.Services.AddSingleton(new APS(clientID, clientSecret, bucket));

var app = builder.Build();

// Enable Swagger in Development
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseDefaultFiles();
app.UseStaticFiles();

app.UseRouting();

app.UseEndpoints(endpoints =>
{
    endpoints.MapControllers();
});

app.Run();
