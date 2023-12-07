import { PrismaModule } from 'src/prisma/prisma.module';
import { SocketGateway } from './socket.gateway';
import { SocketService } from './socket.service';
import { Module } from '@nestjs/common';

@Module({
	providers: [SocketService, SocketGateway],
	imports: [PrismaModule],
	exports: [SocketService, SocketGateway]
  
})

export class SocketModule {}
