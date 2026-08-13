import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { ActualizarPerfilTributarioDto } from './dto/actualizar-perfil-tributario.dto';
import { CrearPerfilTributarioDto } from './dto/crear-perfil-tributario.dto';
import { esRucEcuadorValido } from './utilidades/identificacion-ecuador';

@Injectable()
export class PerfilTributarioService {
  constructor(private readonly prismaService: PrismaService) {}

  async crear(
    usuarioId: number,
    crearPerfilTributarioDto: CrearPerfilTributarioDto,
  ) {
    this.validarRuc(crearPerfilTributarioDto.ruc);
    this.validarCompatibilidadRegimen(
      crearPerfilTributarioDto.tipoContribuyente,
      crearPerfilTributarioDto.regimenTributario,
    );

    const perfilDelUsuario =
      await this.prismaService.perfilTributario.findUnique({
        where: { usuarioId },
        select: { id: true },
      });

    if (perfilDelUsuario) {
      throw new ConflictException(
        'El usuario ya tiene un perfil tributario registrado',
      );
    }

    const perfilConMismoRuc =
      await this.prismaService.perfilTributario.findUnique({
        where: { ruc: crearPerfilTributarioDto.ruc },
        select: { id: true },
      });

    if (perfilConMismoRuc) {
      throw new ConflictException('El RUC ya está registrado');
    }

    try {
      const perfil = await this.prismaService.perfilTributario.create({
        data: {
          ruc: crearPerfilTributarioDto.ruc,
          razonSocial: crearPerfilTributarioDto.razonSocial,
          nombreComercial: crearPerfilTributarioDto.nombreComercial,
          direccionMatriz: crearPerfilTributarioDto.direccionMatriz,
          tipoContribuyente: crearPerfilTributarioDto.tipoContribuyente,
          regimenTributario: crearPerfilTributarioDto.regimenTributario,
          obligadoContabilidad:
            crearPerfilTributarioDto.obligadoContabilidad ?? false,
          codigoContribuyenteEspecial:
            crearPerfilTributarioDto.codigoContribuyenteEspecial,
          codigoAgenteRetencion: crearPerfilTributarioDto.codigoAgenteRetencion,
          establecimiento: crearPerfilTributarioDto.establecimiento ?? '001',
          puntoEmision: crearPerfilTributarioDto.puntoEmision ?? '001',
          ambienteSri: 'PRUEBAS',
          usuarioId,
        },
      });

      return {
        mensaje: 'Perfil tributario creado correctamente',
        perfilTributario: this.presentar(perfil),
      };
    } catch (error: unknown) {
      if (this.esViolacionDeRestriccionUnica(error)) {
        throw new ConflictException('El usuario o el RUC ya tiene un perfil');
      }

      throw error;
    }
  }

  async obtenerDelUsuario(usuarioId: number) {
    const perfil = await this.prismaService.perfilTributario.findFirst({
      where: { usuarioId, activo: true },
    });

    if (!perfil) {
      throw new NotFoundException(
        'El usuario no tiene un perfil tributario activo',
      );
    }

    return {
      perfilTributario: this.presentar(perfil),
    };
  }

  async actualizar(
    usuarioId: number,
    actualizarPerfilTributarioDto: ActualizarPerfilTributarioDto,
  ) {
    if (Object.keys(actualizarPerfilTributarioDto).length === 0) {
      throw new BadRequestException(
        'Debe enviar al menos un dato para actualizar',
      );
    }

    const perfilExistente = await this.prismaService.perfilTributario.findFirst(
      {
        where: { usuarioId, activo: true },
      },
    );

    if (!perfilExistente) {
      throw new NotFoundException(
        'El usuario no tiene un perfil tributario activo',
      );
    }

    if (actualizarPerfilTributarioDto.ruc !== undefined) {
      this.validarRuc(actualizarPerfilTributarioDto.ruc);
    }

    const tipoContribuyente =
      actualizarPerfilTributarioDto.tipoContribuyente ??
      perfilExistente.tipoContribuyente;
    const regimenTributario =
      actualizarPerfilTributarioDto.regimenTributario ??
      perfilExistente.regimenTributario;

    this.validarCompatibilidadRegimen(tipoContribuyente, regimenTributario);

    const cambiaIdentidadDeEmision =
      (actualizarPerfilTributarioDto.ruc !== undefined &&
        actualizarPerfilTributarioDto.ruc !== perfilExistente.ruc) ||
      (actualizarPerfilTributarioDto.establecimiento !== undefined &&
        actualizarPerfilTributarioDto.establecimiento !==
          perfilExistente.establecimiento) ||
      (actualizarPerfilTributarioDto.puntoEmision !== undefined &&
        actualizarPerfilTributarioDto.puntoEmision !==
          perfilExistente.puntoEmision);

    if (cambiaIdentidadDeEmision) {
      const facturasQueFijanIdentidad =
        await this.prismaService.facturaElectronica.count({
          where: {
            perfilTributarioId: perfilExistente.id,
            eliminadoEn: null,
          },
        });

      if (facturasQueFijanIdentidad > 0) {
        throw new ConflictException(
          'No se puede cambiar el RUC, establecimiento o punto de emisión mientras existan borradores activos o facturas emitidas',
        );
      }
    }

    if (
      actualizarPerfilTributarioDto.ruc !== undefined &&
      actualizarPerfilTributarioDto.ruc !== perfilExistente.ruc
    ) {
      const perfilConMismoRuc =
        await this.prismaService.perfilTributario.findUnique({
          where: { ruc: actualizarPerfilTributarioDto.ruc },
          select: { id: true },
        });

      if (perfilConMismoRuc) {
        throw new ConflictException('El RUC ya está registrado');
      }
    }

    try {
      const perfil = await this.prismaService.perfilTributario.update({
        where: { id: perfilExistente.id },
        data: {
          ...(actualizarPerfilTributarioDto.ruc !== undefined
            ? { ruc: actualizarPerfilTributarioDto.ruc }
            : {}),
          ...(actualizarPerfilTributarioDto.razonSocial !== undefined
            ? { razonSocial: actualizarPerfilTributarioDto.razonSocial }
            : {}),
          ...(actualizarPerfilTributarioDto.nombreComercial !== undefined
            ? { nombreComercial: actualizarPerfilTributarioDto.nombreComercial }
            : {}),
          ...(actualizarPerfilTributarioDto.direccionMatriz !== undefined
            ? { direccionMatriz: actualizarPerfilTributarioDto.direccionMatriz }
            : {}),
          ...(actualizarPerfilTributarioDto.tipoContribuyente !== undefined
            ? {
                tipoContribuyente:
                  actualizarPerfilTributarioDto.tipoContribuyente,
              }
            : {}),
          ...(actualizarPerfilTributarioDto.regimenTributario !== undefined
            ? {
                regimenTributario:
                  actualizarPerfilTributarioDto.regimenTributario,
              }
            : {}),
          ...(actualizarPerfilTributarioDto.obligadoContabilidad !== undefined
            ? {
                obligadoContabilidad:
                  actualizarPerfilTributarioDto.obligadoContabilidad,
              }
            : {}),
          ...(actualizarPerfilTributarioDto.codigoContribuyenteEspecial !==
          undefined
            ? {
                codigoContribuyenteEspecial:
                  actualizarPerfilTributarioDto.codigoContribuyenteEspecial,
              }
            : {}),
          ...(actualizarPerfilTributarioDto.codigoAgenteRetencion !== undefined
            ? {
                codigoAgenteRetencion:
                  actualizarPerfilTributarioDto.codigoAgenteRetencion,
              }
            : {}),
          ...(actualizarPerfilTributarioDto.establecimiento !== undefined
            ? {
                establecimiento: actualizarPerfilTributarioDto.establecimiento,
              }
            : {}),
          ...(actualizarPerfilTributarioDto.puntoEmision !== undefined
            ? { puntoEmision: actualizarPerfilTributarioDto.puntoEmision }
            : {}),
        },
      });

      return {
        mensaje: 'Perfil tributario actualizado correctamente',
        perfilTributario: this.presentar(perfil),
      };
    } catch (error: unknown) {
      if (this.esViolacionDeRestriccionUnica(error)) {
        throw new ConflictException('El RUC ya está registrado');
      }

      throw error;
    }
  }

  private validarCompatibilidadRegimen(
    tipoContribuyente: 'PERSONA_NATURAL' | 'SOCIEDAD',
    regimenTributario:
      | 'GENERAL'
      | 'RIMPE_NEGOCIO_POPULAR'
      | 'RIMPE_EMPRENDEDOR',
  ): void {
    if (
      tipoContribuyente === 'SOCIEDAD' &&
      regimenTributario === 'RIMPE_NEGOCIO_POPULAR'
    ) {
      throw new BadRequestException(
        'Una sociedad no puede configurarse como RIMPE Negocio Popular',
      );
    }
  }

  private validarRuc(ruc: string): void {
    if (!esRucEcuadorValido(ruc)) {
      throw new BadRequestException(
        'El RUC no tiene un formato o dígito verificador válido',
      );
    }
  }

  private presentar(perfil: {
    id: number;
    ruc: string;
    razonSocial: string;
    nombreComercial: string | null;
    direccionMatriz: string;
    tipoContribuyente: string;
    regimenTributario: string;
    obligadoContabilidad: boolean;
    codigoContribuyenteEspecial: string | null;
    codigoAgenteRetencion: string | null;
    establecimiento: string;
    puntoEmision: string;
    ambienteSri: string;
    activo: boolean;
    creadoEn: Date;
    actualizadoEn: Date;
  }) {
    return {
      id: perfil.id,
      ruc: perfil.ruc,
      razonSocial: perfil.razonSocial,
      nombreComercial: perfil.nombreComercial,
      direccionMatriz: perfil.direccionMatriz,
      tipoContribuyente: perfil.tipoContribuyente,
      regimenTributario: perfil.regimenTributario,
      obligadoContabilidad: perfil.obligadoContabilidad,
      codigoContribuyenteEspecial: perfil.codigoContribuyenteEspecial,
      codigoAgenteRetencion: perfil.codigoAgenteRetencion,
      establecimiento: perfil.establecimiento,
      puntoEmision: perfil.puntoEmision,
      ambienteSri: perfil.ambienteSri,
      activo: perfil.activo,
      creadoEn: perfil.creadoEn,
      actualizadoEn: perfil.actualizadoEn,
    };
  }

  private esViolacionDeRestriccionUnica(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2002'
    );
  }
}
