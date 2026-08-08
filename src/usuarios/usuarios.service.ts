import { ConflictException, Injectable } from '@nestjs/common';

import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

interface DatosNuevoUsuario {
  nombre: string;
  correo: string;
  contrasenaHash: string;
}

@Injectable()
export class UsuariosService {
  constructor(private readonly prismaService: PrismaService) {}

  // Busca un usuario mediante su correo.
  async buscarPorCorreo(correo: string) {
    return this.prismaService.usuario.findUnique({
      where: {
        correo,
      },
    });
  }

  // Guarda un usuario nuevo sin devolver su contraseña hash.
  async crear(datos: DatosNuevoUsuario) {
    try {
      return await this.prismaService.usuario.create({
        data: {
          nombre: datos.nombre,
          correo: datos.correo,
          contrasenaHash: datos.contrasenaHash,
        },
        select: {
          id: true,
          nombre: true,
          correo: true,
          rol: true,
          activo: true,
          creadoEn: true,
          actualizadoEn: true,
        },
      });
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Ya existe un usuario registrado con ese correo',
        );
      }

      throw error;
    }
  }
}
