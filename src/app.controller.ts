// Body obtiene el contenido enviado en una petición.
// Controller declara el controlador.
// Get y Post permiten crear endpoints HTTP.
import { Body, Controller, Get, Post } from '@nestjs/common';

// Decoradores utilizados para documentar los endpoints en Swagger.
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

// DTO que define y valida los datos del movimiento.
import { CrearMovimientoPruebaDto } from './dto/crear-movimiento-prueba.dto';

// Servicio que contiene la lógica de la aplicación.
import { AppService } from './app.service';

// Agrupamos los endpoints dentro de la sección "General" de Swagger.
@ApiTags('General')
@Controller()
export class AppController {
  // NestJS proporciona automáticamente una instancia de AppService.
  constructor(private readonly appService: AppService) {}

  // Endpoint GET /api.
  @ApiOperation({
    summary: 'Mostrar el mensaje inicial de la API',
  })
  @ApiOkResponse({
    description: 'La API respondió correctamente.',
    schema: {
      example: 'Hello World!',
    },
  })
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // Endpoint GET /api/estado.
  @ApiOperation({
    summary: 'Consultar el estado de la API',
  })
  @ApiOkResponse({
    description: 'Información del estado actual del backend.',
    schema: {
      example: {
        aplicacion: 'FinTech Backend',
        estado: 'activo',
        mensaje: 'La API está funcionando correctamente',
        version: '1.0.0',
      },
    },
  })
  @Get('estado')
  getEstado() {
    return this.appService.getEstado();
  }

  // Endpoint POST /api/movimientos-prueba.
  @ApiOperation({
    summary: 'Validar un movimiento financiero de prueba',
  })
  @ApiCreatedResponse({
    description: 'El movimiento fue recibido y validado correctamente.',
  })
  @ApiBadRequestResponse({
    description: 'Uno o varios datos enviados son incorrectos.',
  })
  @Post('movimientos-prueba')
  crearMovimientoPrueba(@Body() datos: CrearMovimientoPruebaDto) {
    return this.appService.crearMovimientoPrueba(datos);
  }
}
