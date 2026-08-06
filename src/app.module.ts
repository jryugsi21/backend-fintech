// Module permite organizar la aplicación.
import { Module } from '@nestjs/common';

// Permite cargar las variables almacenadas en .env.
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CategoriasModule } from './categorias/categorias.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsuariosModule } from './usuarios/usuarios.module';

@Module({
  imports: [
    // Lee el archivo .env y comparte sus variables.
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Habilita la conexión con Prisma.
    PrismaModule,

    // Habilita las funcionalidades de categorías.
    CategoriasModule,

    UsuariosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
