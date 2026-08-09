import { Module } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { MetasAhorroController } from './metas-ahorro.controller';
import { MetasAhorroService } from './metas-ahorro.service';

@Module({
  controllers: [MetasAhorroController],
  providers: [MetasAhorroService, PrismaService],
})
export class MetasAhorroModule {}
