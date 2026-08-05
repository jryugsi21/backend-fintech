// Injectable permite que este servicio sea administrado por NestJS.
import { Injectable } from '@nestjs/common';

// Importamos el DTO para conocer la estructura de los datos recibidos.
import { CrearMovimientoPruebaDto } from './dto/crear-movimiento-prueba.dto';

@Injectable()
export class AppService {
  // Devuelve el mensaje inicial de la API.
  getHello(): string {
    return 'Hello World!';
  }

  // Devuelve información sobre el estado del backend.
  getEstado() {
    return {
      aplicacion: 'FinTech Backend',
      estado: 'activo',
      mensaje: 'La API está funcionando correctamente',
      version: '1.0.0',
    };
  }

  // Simula el registro de un movimiento financiero.
  // Todavía no utiliza ni guarda información en PostgreSQL.
  crearMovimientoPrueba(datos: CrearMovimientoPruebaDto) {
    return {
      mensaje: 'Movimiento recibido y validado correctamente',
      movimiento: {
        tipo: datos.tipo,
        monto: datos.monto,
        descripcion: datos.descripcion ?? 'Sin descripción',
        fecha: datos.fecha,
        categoriaId: datos.categoriaId,
      },
    };
  }
}
