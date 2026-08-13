import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import type { SolicitudAutenticada } from '../auth/interfaces/usuario-autenticado.interface';
import { CalcularImpuestoRentaDto } from './dto/calcular-impuesto-renta.dto';
import { ConfigurarCategoriaTributariaDto } from './dto/configurar-categoria-tributaria.dto';
import { ResumenTributarioService } from './resumen-tributario.service';

@ApiTags('Facturación - Resumen tributario y Fintech')
@ApiBearerAuth('access-token')
@Controller('facturacion')
export class ResumenTributarioController {
  constructor(
    private readonly resumenTributarioService: ResumenTributarioService,
  ) {}

  @Put('configuracion-categorias')
  @ApiOperation({
    summary:
      'Relacionar una categoría financiera con su tratamiento tributario',
  })
  @ApiOkResponse({ description: 'Configuración guardada correctamente' })
  @ApiBadRequestResponse({
    description: 'El tratamiento no coincide con la categoría',
  })
  @ApiNotFoundResponse({ description: 'La categoría financiera no existe' })
  configurarCategoria(
    @Req() solicitud: SolicitudAutenticada,
    @Body() dto: ConfigurarCategoriaTributariaDto,
  ) {
    return this.resumenTributarioService.configurarCategoria(
      solicitud.usuario.sub,
      dto,
    );
  }

  @Get('configuracion-categorias')
  @ApiOperation({ summary: 'Listar la clasificación tributaria de categorías' })
  @ApiOkResponse({ description: 'Configuraciones obtenidas correctamente' })
  listarConfiguraciones(@Req() solicitud: SolicitudAutenticada) {
    return this.resumenTributarioService.listarConfiguraciones(
      solicitud.usuario.sub,
    );
  }

  @Get('resumen-tributario/:anio')
  @ApiOperation({
    summary: 'Consultar ingresos, gastos, IVA y gastos personales del año',
  })
  @ApiParam({ name: 'anio', type: Number, example: 2026 })
  @ApiOkResponse({ description: 'Resumen tributario obtenido correctamente' })
  @ApiBadRequestResponse({ description: 'El año no es válido' })
  obtenerResumen(
    @Req() solicitud: SolicitudAutenticada,
    @Param('anio', ParseIntPipe) anio: number,
  ) {
    return this.resumenTributarioService.obtenerResumen(
      solicitud.usuario.sub,
      anio,
    );
  }

  @Post('impuesto-renta/:anio/calcular')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Calcular una estimación del Impuesto a la Renta' })
  @ApiParam({ name: 'anio', type: Number, example: 2026 })
  @ApiOkResponse({ description: 'Estimación calculada correctamente' })
  @ApiBadRequestResponse({
    description: 'Falta una tabla o los datos no son válidos',
  })
  calcularImpuestoRenta(
    @Req() solicitud: SolicitudAutenticada,
    @Param('anio', ParseIntPipe) anio: number,
    @Body() dto: CalcularImpuestoRentaDto,
  ) {
    return this.resumenTributarioService.calcularImpuestoRenta(
      solicitud.usuario.sub,
      anio,
      dto,
    );
  }
}
