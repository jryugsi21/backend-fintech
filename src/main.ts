// ValidationPipe permite validar globalmente los datos recibidos.
import { ValidationPipe } from '@nestjs/common';

// NestFactory permite crear e iniciar la aplicación NestJS.
import { NestFactory } from '@nestjs/core';

// Herramientas utilizadas para generar la documentación Swagger.
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

// Módulo principal del backend.
import { AppModule } from './app.module';

// Función principal encargada de iniciar la aplicación.
async function bootstrap() {
  // Creamos la aplicación utilizando AppModule.
  const app = await NestFactory.create(AppModule);

  // Todos los endpoints comenzarán con /api.
  app.setGlobalPrefix('api');

  // Aplicamos la validación a todos los endpoints del backend.
  app.useGlobalPipes(
    new ValidationPipe({
      // Solo permite propiedades definidas en los DTO.
      whitelist: true,

      // Rechaza la petición si contiene propiedades no permitidas.
      forbidNonWhitelisted: true,

      // Transforma los datos recibidos al tipo definido en el DTO.
      transform: true,
    }),
  );

  // Configuración general de Swagger.
  const configuracionSwagger = new DocumentBuilder()
    .setTitle('API FinTech')
    .setDescription(
      'Documentación de los endpoints del backend de la aplicación FinTech',
    )
    .setVersion('1.0.0')
    .build();

  // Swagger examina los controladores y genera la documentación.
  const documentoSwagger = SwaggerModule.createDocument(
    app,
    configuracionSwagger,
  );

  // Publicamos Swagger en /api/docs.
  SwaggerModule.setup('api/docs', app, documentoSwagger);

  // Utilizamos PORT si está configurado; de lo contrario, usamos 3000.
  const puerto = process.env.PORT ?? 3000;

  // Encendemos el servidor.
  await app.listen(puerto);
}

// Iniciamos la aplicación.
// void indica que ejecutamos esta función asíncrona sin guardar su resultado.
void bootstrap();
