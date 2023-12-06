import { PrismaModule } from 'src/prisma/prisma.module';
import { SocketGateway } from './socket.gateway';
import { SocketService } from './socket.service';
import { Module } from '@nestjs/common';
import { SocketController } from './socket.controller';

@Module({
	providers: [SocketService, SocketGateway],
	controllers: [SocketController],
	imports: [PrismaModule],
	exports: [SocketService, SocketGateway]
  
})

export class SocketModule {}
