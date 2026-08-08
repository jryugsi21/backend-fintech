import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UsuariosService } from '../usuarios/usuarios.service';
import { IniciarSesionDto } from './dto/iniciar-sesion.dto';
import { RegistrarUsuarioDto } from './dto/registrar-usuario.dto';

const RONDAS_HASH = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
  ) {}

  // Registra un usuario nuevo.
  async registrar(registrarUsuarioDto: RegistrarUsuarioDto) {
    const correoNormalizado = registrarUsuarioDto.correo.trim().toLowerCase();

    const usuarioExistente =
      await this.usuariosService.buscarPorCorreo(correoNormalizado);

    if (usuarioExistente) {
      throw new ConflictException(
        'Ya existe un usuario registrado con ese correo',
      );
    }

    const contrasenaHash = await bcrypt.hash(
      registrarUsuarioDto.contrasena,
      RONDAS_HASH,
    );

    const usuario = await this.usuariosService.crear({
      nombre: registrarUsuarioDto.nombre.trim().replace(/\s+/g, ' '),
      correo: correoNormalizado,
      contrasenaHash,
    });

    return {
      mensaje: 'Usuario registrado correctamente',
      usuario,
    };
  }

  // Comprueba las credenciales y genera un token JWT.
  async iniciarSesion(iniciarSesionDto: IniciarSesionDto) {
    const correoNormalizado = iniciarSesionDto.correo.trim().toLowerCase();

    const usuario =
      await this.usuariosService.buscarPorCorreo(correoNormalizado);

    // Se utiliza el mismo mensaje para no revelar
    // si el correo existe o si la contraseña fue incorrecta.
    if (!usuario) {
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    }

    const contrasenaCorrecta = await bcrypt.compare(
      iniciarSesionDto.contrasena,
      usuario.contrasenaHash,
    );

    if (!contrasenaCorrecta) {
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    }

    if (!usuario.activo) {
      throw new ForbiddenException('La cuenta se encuentra desactivada');
    }

    // Información que se guardará dentro del token.
    const contenidoToken = {
      sub: usuario.id,
      correo: usuario.correo,
      rol: usuario.rol,
    };

    const accessToken = await this.jwtService.signAsync(contenidoToken);

    return {
      mensaje: 'Inicio de sesión correcto',
      accessToken,
      tipoToken: 'Bearer',
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
        activo: usuario.activo,
      },
    };
  }
}
