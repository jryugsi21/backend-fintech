// Module permite organizar la aplicación.
import { Module } from '@nestjs/common';

// Permite cargar las variables almacenadas en .env.
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CategoriasModule } from './categorias/categorias.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { AuthModule } from './auth/auth.module';
import { MovimientosModule } from './movimientos/movimientos.module';
import { PresupuestosModule } from './presupuestos/presupuestos.module';

@Module({
  imports: [
    // Lee el archivo .env y comparte sus variables.
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    CategoriasModule,
    UsuariosModule,
    AuthModule,
    MovimientosModule,
    PresupuestosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
