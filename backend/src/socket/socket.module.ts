import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { SocketService } from './socket.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
	providers: [SocketService, SocketGateway],
	imports: [PrismaModule],
	exports: [SocketService, SocketGateway]
  
})

export class SocketModule {}
