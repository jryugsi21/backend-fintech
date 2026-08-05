// Module permite declarar un módulo de NestJS.
import { Module } from '@nestjs/common';

// Importamos el controlador principal.
import { AppController } from './app.controller';

// Importamos el servicio principal.
import { AppService } from './app.service';

// Declaramos el módulo principal de la aplicación.
@Module({
  // Aquí se registrarán otros módulos, como usuarios o movimientos.
  imports: [],

  // Registramos los controladores que reciben peticiones HTTP.
  controllers: [AppController],

  // Registramos los servicios que contienen la lógica.
  providers: [AppService],
})
export class AppModule {}
