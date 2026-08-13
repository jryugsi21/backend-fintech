import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';

export const TIPOS_CONTRIBUYENTE = ['PERSONA_NATURAL', 'SOCIEDAD'] as const;

export const REGIMENES_TRIBUTARIOS = [
  'GENERAL',
  'RIMPE_NEGOCIO_POPULAR',
  'RIMPE_EMPRENDEDOR',
] as const;

export type TipoContribuyenteDto = (typeof TIPOS_CONTRIBUYENTE)[number];
export type RegimenTributarioDto = (typeof REGIMENES_TRIBUTARIOS)[number];

function limpiarTexto(valor: unknown): unknown {
  return typeof valor === 'string' ? valor.trim() : valor;
}

function limpiarTextoOpcional(valor: unknown): unknown {
  if (typeof valor !== 'string') {
    return valor;
  }

  const texto = valor.trim();
  return texto.length === 0 ? undefined : texto;
}

function transformarBooleano(valor: unknown): unknown {
  if (valor === 'true') {
    return true;
  }

  if (valor === 'false') {
    return false;
  }

  return valor;
}

export class CrearPerfilTributarioDto {
  @ApiProperty({
    description: 'RUC de trece dígitos del emisor',
    example: '1799999990001',
  })
  @Transform(({ value }) => limpiarTexto(value))
  @IsString({ message: 'El RUC debe ser texto' })
  @Matches(/^\d{13}$/, {
    message: 'El RUC debe contener exactamente trece dígitos',
  })
  ruc!: string;

  @ApiProperty({
    description: 'Nombre legal registrado en el RUC',
    example: 'SERVICIOS FINANCIEROS EJEMPLO S.A.',
  })
  @Transform(({ value }) => limpiarTexto(value))
  @IsString({ message: 'La razón social debe ser texto' })
  @IsNotEmpty({ message: 'La razón social es obligatoria' })
  @MaxLength(300, { message: 'La razón social admite máximo 300 caracteres' })
  razonSocial!: string;

  @ApiPropertyOptional({
    description: 'Nombre comercial del contribuyente',
    example: 'Fintech Ejemplo',
  })
  @Transform(({ value }) => limpiarTextoOpcional(value))
  @IsOptional()
  @IsString({ message: 'El nombre comercial debe ser texto' })
  @MaxLength(300, {
    message: 'El nombre comercial admite máximo 300 caracteres',
  })
  nombreComercial?: string;

  @ApiProperty({
    description: 'Dirección matriz registrada para el emisor',
    example: 'Av. Amazonas N34-123, Quito',
  })
  @Transform(({ value }) => limpiarTexto(value))
  @IsString({ message: 'La dirección matriz debe ser texto' })
  @IsNotEmpty({ message: 'La dirección matriz es obligatoria' })
  @MaxLength(300, {
    message: 'La dirección matriz admite máximo 300 caracteres',
  })
  direccionMatriz!: string;

  @ApiProperty({
    enum: TIPOS_CONTRIBUYENTE,
    example: 'PERSONA_NATURAL',
  })
  @IsIn(TIPOS_CONTRIBUYENTE, {
    message: 'El tipo de contribuyente no es válido',
  })
  tipoContribuyente!: TipoContribuyenteDto;

  @ApiProperty({
    enum: REGIMENES_TRIBUTARIOS,
    example: 'GENERAL',
  })
  @IsIn(REGIMENES_TRIBUTARIOS, {
    message: 'El régimen tributario no es válido',
  })
  regimenTributario!: RegimenTributarioDto;

  @ApiPropertyOptional({
    description:
      'Indica si el contribuyente está obligado a llevar contabilidad',
    default: false,
  })
  @Transform(({ value }) => transformarBooleano(value))
  @IsOptional()
  @IsBoolean({ message: 'obligadoContabilidad debe ser verdadero o falso' })
  obligadoContabilidad?: boolean;

  @ApiPropertyOptional({
    description: 'Código de resolución de contribuyente especial',
    example: '1234',
  })
  @Transform(({ value }) => limpiarTextoOpcional(value))
  @IsOptional()
  @Matches(/^\d{1,20}$/, {
    message: 'El código de contribuyente especial solo admite números',
  })
  codigoContribuyenteEspecial?: string;

  @ApiPropertyOptional({
    description: 'Código de resolución como agente de retención',
    example: '1',
  })
  @Transform(({ value }) => limpiarTextoOpcional(value))
  @IsOptional()
  @Matches(/^\d{1,20}$/, {
    message: 'El código de agente de retención solo admite números',
  })
  codigoAgenteRetencion?: string;

  @ApiPropertyOptional({
    description: 'Código de establecimiento de tres dígitos',
    default: '001',
  })
  @Transform(({ value }) => limpiarTextoOpcional(value))
  @IsOptional()
  @Length(3, 3, { message: 'El establecimiento debe tener tres dígitos' })
  @Matches(/^\d{3}$/, { message: 'El establecimiento solo admite números' })
  establecimiento?: string;

  @ApiPropertyOptional({
    description: 'Código de punto de emisión de tres dígitos',
    default: '001',
  })
  @Transform(({ value }) => limpiarTextoOpcional(value))
  @IsOptional()
  @Length(3, 3, { message: 'El punto de emisión debe tener tres dígitos' })
  @Matches(/^\d{3}$/, { message: 'El punto de emisión solo admite números' })
  puntoEmision?: string;
}
